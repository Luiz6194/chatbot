import json
import boto3
import os

#create a bedrock client and s3 client outside handler for better performance
bedrock_client = boto3.client("bedrock-agent-runtime")
s3_client = boto3.client('s3')

template_2 = """You are an AI assistant for AWS Solution Architects (SAs), specializing in CSC Blueprints. Your primary function is to help SAs navigate and find information about five specific blueprints: Generative AI, Cloud Foundations, Security, Connect, and Data/Analytics.

For each blueprint, you should be able to provide information on:

1. Use cases
2. Solutions
3. Partners
4. Community resources
5. Assets (including workshops and immersion days)

You should be able to handle two types of queries the best:

1. Use case scenarios: When users describe a situation, analyze their needs and guide them to relevant blueprint(s). Provide a brief explanation of how the blueprint addresses their use case, followed by numbered steps for implementation.
2. Specific information requests: When users ask for particular details, provide a concise summary of the requested information.

For all responses:

1. Identify relevant blueprint(s) and areas of interest (use cases, solutions, partners, community resources, assets).
2. Provide accurate, concise information based solely on CSC Blueprint content.
3. Maintain a professional and helpful tone.
4. If uncertain, state so rather than guessing.
5. If they are asking for blueprints that you can not answer to then DO NOT ANSWER.

ALWAYS Tailor your response length to the query type: more detailed for use case scenarios, briefer for specific information requests.

Here are the search results to use for everything that was just stated in numbered order:
$search_results$

Here are some example interactions to guide your responses. For all generated responses you MUST to include a new line(\n) before EVERY bullet point, including the first one to make each point start in a new line:

The following is the first type of user question which is explaining the use case they have:

User: Our marketing team wants to create personalized content for our website visitors based on their browsing history and preferences. How can we implement this?

Bot: This use case aligns well with the Generative AI blueprint. GenAI can help create personalized content dynamically, enhancing user engagement and marketing effectiveness.
Here are steps to address this use case using the GenAI Blueprint.\r\n


\n\n- Identify specific requirements for personalized content generation using GenAI.

\n\n- Assess existing data sources, including visitor browsing history and preferences.

\n\n- Introduce relevant AWS GenAI services, such as Amazon Personalize for recommendation systems and Amazon Bedrock for content generation.

\n\n- Discuss potential challenges like data privacy and content quality assurance.

\n\n- Propose a high-level architecture integrating AWS GenAI services with your website.

\n\n- Consider engaging an AWS Partner specializing in GenAI for marketing applications.

\n\n- Provide information on GenAI Blueprint training resources for your marketing team.

\n\n- Suggest a proof-of-concept to demonstrate personalized content generation.

The next example is about the user requesting specific information:

User: Give me the GenAI Amazon Q for Builders Immersion Day

Bot: The GenAI Amazon Q for Builders Immersion Day is an asset within the Generative AI blueprint. It's a hands-on learning experience designed to help developers and builders understand and leverage Amazon Q, AWS's AI-powered assistant for developers.
This immersion day can help you by.\r\n

\n\n- Providing practical experience with Amazon Q's capabilities

\n\n- Demonstrating how to integrate Amazon Q into your development workflow

\n\n- Showing how to use AI to increase productivity and code quality

It's particularly useful if you're looking to enhance your team's ability to build and deploy GenAI applications more efficiently using AWS tools.

Always follow this format, ensuring there's a new line(\n) before each numbered point including the first one.

$output_format_instructions$
"""
def lambda_handler(event, context):
    
    body = json.loads(event.get('body', ''))
    # Extract the query from the event
    #prompt = event["prompt"]
    prompt = body.get('prompt', '')
    #retrieve session Id to get session context
    session_Id = body.get('sessionId', '')

    


    # Define the knowledge base ID and model ARN
    knowledge_base_id = os.environ['KNOWLEDGE_BASE_ID']
    model_arn = os.environ['MODEL_ARN']

    # Define the retrieve and generate configuration

    retrieve_and_generate_config = {
    
        'type': 'KNOWLEDGE_BASE',
        
    
        'knowledgeBaseConfiguration': {
    
            'knowledgeBaseId': knowledge_base_id,
            
            'modelArn': model_arn,
            'generationConfiguration': {
                
                 'guardrailConfiguration': {
                     
                    'guardrailId': 'bsvkc4bd6v3h',
                    'guardrailVersion': '1'
                },

                
                'promptTemplate': {

                    'textPromptTemplate': template_2}},
            
            'retrievalConfiguration': {
    
                'vectorSearchConfiguration': {
    
                    'numberOfResults': 50,
                    'overrideSearchType': 'HYBRID'
    
                },
    
            },
    
        },
    
    }
    # Make the RetrieveAndGenerate API call
    retrieve_and_generate_kwargs = {
        'input': {
            'text': prompt
        },
        'retrieveAndGenerateConfiguration': retrieve_and_generate_config
    }

    # Include the session ID as a separate parameter if it's provide
    if session_Id:
        retrieve_and_generate_kwargs['sessionId'] = session_Id


    response = bedrock_client.retrieve_and_generate(**retrieve_and_generate_kwargs)
    #Gran new session Id if there is one
    new_session_id = response.get('sessionId', '')
    generated_text = response.get('output', '')
   
   
    #This is done to grab the S3 object url
    s3_uris = set()  
    for citation in response.get('citations', []):
        for reference in citation.get('retrievedReferences', []):
            location = reference.get('location', {})
            s3_location = location.get('s3Location', {})
            uri = s3_location.get('uri', '')
            if uri:
                s3_uris.add(uri)  
    
  
    s3_uris = list(s3_uris)
    
    object_uris = set() 
    #This is done to grab the website URL from the s3 object
    for uri in s3_uris:
        bucket_name, key = uri.replace('s3://', '').split('/', 1)
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        metadata = response['Metadata']
        if 'url' in metadata:
            object_uris.add(metadata['url']) 
    
    object_uris = list(object_uris)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'object_uris': object_uris,
            'generated_text':generated_text,
            'sessionId':new_session_id
            }),
            
            'headers':{
            'Access-Control-Allow-Origin': '*' # Replace with your allowed origin(s)

            }
    }
