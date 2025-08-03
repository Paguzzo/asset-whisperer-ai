import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

const AddAssetDialog = ({ onAssetAdded }: { onAssetAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    asset_type: '',
    exchange: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          symbol: formData.symbol.toUpperCase(),
          name: formData.name,
          asset_type: formData.asset_type,
          exchange: formData.exchange || null
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Ativo já existe",
            description: "Este ativo já está sendo monitorado.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Ativo adicionado!",
          description: `${formData.symbol} foi adicionado para monitoramento.`,
        });
        
        setFormData({ symbol: '', name: '', asset_type: '', exchange: '' });
        setOpen(false);
        onAssetAdded();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Ativo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ativo</DialogTitle>
          <DialogDescription>
            Adicione um ativo para monitoramento automático de preços.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset_type">Tipo de Ativo</Label>
            <Select
              value={formData.asset_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, asset_type: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brazilian_stock">Ação Brasileira</SelectItem>
                <SelectItem value="us_stock">Ação Americana</SelectItem>
                <SelectItem value="crypto">Criptomoeda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Símbolo</Label>
            <Input
              id="symbol"
              placeholder={
                formData.asset_type === 'brazilian_stock' ? 'PETR4' :
                formData.asset_type === 'us_stock' ? 'AAPL' :
                formData.asset_type === 'crypto' ? 'BTC' : 'Ex: PETR4'
              }
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome completo do ativo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchange">Bolsa (opcional)</Label>
            <Input
              id="exchange"
              placeholder={
                formData.asset_type === 'brazilian_stock' ? 'B3' :
                formData.asset_type === 'us_stock' ? 'NASDAQ' :
                formData.asset_type === 'crypto' ? 'Binance' : 'Ex: B3'
              }
              value={formData.exchange}
              onChange={(e) => setFormData(prev => ({ ...prev, exchange: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetDialog;