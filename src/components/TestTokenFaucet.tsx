import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Coins, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TestTokenFaucetProps {
  onTokensAdded: () => void;
}

export const TestTokenFaucet: React.FC<TestTokenFaucetProps> = ({ onTokensAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTestTokens = async () => {
    setIsLoading(true);
    
    try {
      // Simular obtenção de tokens de teste
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular adição de tokens à carteira
      localStorage.setItem('testnet_usdc_balance', '1000.00');
      localStorage.setItem('testnet_brz_balance', '5200.00');
      
      toast({
        title: "Tokens de teste adicionados!",
        description: "1000 USDC e 5200 BRZ foram adicionados à sua carteira.",
      });
      
      onTokensAdded();
      
    } catch (error) {
      toast({
        title: "Erro ao obter tokens",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Droplets className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Faucet de Tokens de Teste</CardTitle>
        <CardDescription>
          Obtenha tokens USDC e BRZ de teste na Base Sepolia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta é uma rede de teste. Os tokens não têm valor real.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">USDC (Teste)</span>
            <Badge variant="secondary">1.000 tokens</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">BRZ (Teste)</span>
            <Badge variant="secondary">5.200 tokens</Badge>
          </div>
        </div>

        <Button 
          onClick={handleGetTestTokens}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Coins className="mr-2 h-4 w-4 animate-spin" />
              Obtendo tokens...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Obter Tokens de Teste
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Conecte-se à rede Base Sepolia</p>
          <p>• Tokens serão adicionados automaticamente</p>
          <p>• Use para testar swaps e transações</p>
        </div>
      </CardContent>
    </Card>
  );
};