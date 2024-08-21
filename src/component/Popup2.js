import React from 'react';
import { Modal, Box, SpaceBetween, Button } from '@cloudscape-design/components';

const Popup = ({ onYes, onNo }) => {
  return (
    <Modal
      onDismiss={onNo}
      visible={true}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onNo}>No, don't send it</Button>
            <Button variant="primary" onClick={onYes}>Yes, send it</Button>
          </SpaceBetween>
        </Box>
      }
      header="Notification"
    >
      The blueprint was not found. Would you like to send a notification to the team?
    </Modal>
  );
};

export default Popup;