'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRunScript = async () => {
    setIsLoading(true);
    setOutput('');
    setError('');

    try {
      const response = await fetch('/api/run-script', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error executing script');
      }

      const data = await response.json();
      setOutput(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Sincronización de Datos</CardTitle>
          <CardDescription>
            Haz clic en el botón para iniciar la sincronización de datos desde Business Central a Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button onClick={handleRunScript} disabled={isLoading}>
              {isLoading ? 'Sincronizando...' : 'Iniciar Sincronización'}
            </Button>
            {isLoading && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">La sincronización está en progreso. Esto puede tardar unos minutos...</p>
                <Progress value={undefined} className="w-full animate-pulse" />
              </div>
            )}
            {output && (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Sincronización completada</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-slate-50">
                    {output}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-slate-50">
                    {error}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
