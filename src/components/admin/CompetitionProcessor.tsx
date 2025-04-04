import React, { useState } from 'react';
import { Box, Button, Card, CardBody, Flex, Heading, Text, useToast, VStack } from '@chakra-ui/react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebaseApp } from '../../contexts/FirebaseContext';

const CompetitionProcessor: React.FC = () => {
  const { app } = useFirebaseApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<string | null>(null);
  const toast = useToast();

  const handleProcessCompetitions = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingResults(null);
    
    try {
      const functions = getFunctions(app, 'europe-west2');
      const processCompetitions = httpsCallable(functions, 'manualProcessCompetitions');
      
      const result = await processCompetitions();
      const data = result.data as { success: boolean; processedCount: number };
      
      if (data.success) {
        setProcessingResults(`Successfully processed ${data.processedCount} competitions.`);
        toast({
          title: 'Competitions Processed',
          description: `Successfully processed ${data.processedCount} competitions.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setProcessingResults('Error processing competitions.');
        toast({
          title: 'Processing Error',
          description: 'Failed to process competitions.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error processing competitions:', error);
      setProcessingResults('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      toast({
        title: 'Processing Error',
        description: 'An error occurred while processing competitions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card variant="outlined" borderWidth="1px" borderRadius="lg" m={4}>
      <CardBody>
        <VStack spacing={4} align="start">
          <Heading size="md">Competition Processor</Heading>
          <Text>
            Use this tool to manually process all competitions that have ended and are waiting to be completed.
            This will select winners for ended competitions using a fair and transparent selection algorithm.
          </Text>
          <Text fontSize="sm" color="gray.600">
            Note: Competitions are automatically processed every hour, but you can use this to process them immediately.
          </Text>
          
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Button
              colorScheme="blue"
              isLoading={isProcessing}
              loadingText="Processing..."
              onClick={handleProcessCompetitions}
            >
              Process Ended Competitions
            </Button>
          </Flex>
          
          {processingResults && (
            <Box mt={4} p={4} borderRadius="md" bg="gray.50" width="100%">
              <Text fontWeight="bold">Results:</Text>
              <Text>{processingResults}</Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CompetitionProcessor; 