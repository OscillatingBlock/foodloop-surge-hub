
import React, { useState } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ApiExample = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('data');

  const fetchFromBackend = async (endpoint: string, apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    setActiveEndpoint(endpoint);
    
    try {
      const response = await apiFunction();
      setData(response);
      toast({
        title: "Success",
        description: `Data fetched successfully from ${endpoint} endpoint`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render different visualizations based on the data type
  const renderDataVisual = () => {
    if (!data) return null;
    
    // If data is an array, render as table
    if (Array.isArray(data)) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {data[0] && Object.keys(data[0]).map(key => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {Object.values(item).map((value: any, i) => (
                  <TableCell key={i}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    
    // Otherwise render as JSON
    return (
      <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-50 rounded-md">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Flask Backend Integration</CardTitle>
        <CardDescription>Interact with your Flask backend and see how it controls the UI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => fetchFromBackend('data', api.getData)} 
            disabled={loading}
            variant={activeEndpoint === 'data' ? 'default' : 'outline'}
          >
            Fetch Test Data
          </Button>
          <Button 
            onClick={() => fetchFromBackend('stats', api.getStats)} 
            disabled={loading}
            variant={activeEndpoint === 'stats' ? 'default' : 'outline'}
          >
            Get Statistics
          </Button>
          <Button 
            onClick={() => fetchFromBackend('food-items', api.getFoodItems)} 
            disabled={loading}
            variant={activeEndpoint === 'food-items' ? 'default' : 'outline'}
          >
            Available Food Items
          </Button>
          <Button 
            onClick={() => fetchFromBackend('organizations', api.getOrganizations)} 
            disabled={loading}
            variant={activeEndpoint === 'organizations' ? 'default' : 'outline'}
          >
            Organizations
          </Button>
        </div>
        
        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {data && !loading && (
          <div className="bg-white border rounded-md">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-medium">Response from {activeEndpoint} endpoint:</h3>
            </div>
            <div className="p-4">
              {renderDataVisual()}
            </div>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-md">
          <p className="font-semibold mb-2">Implementation Tips:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Ensure your Flask backend is running at http://localhost:5000</li>
            <li>Set up CORS in Flask: <code>from flask_cors import CORS; CORS(app)</code></li>
            <li>Create endpoints that match the API client functions</li>
            <li>Return properly formatted JSON responses</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiExample;
