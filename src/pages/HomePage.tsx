import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  Bell, 
  Brain, 
  DollarSign, 
  ArrowRight, 
  Users, 
  CheckCircle,
  Star,
  Clock,
  Shield,
  BarChart3,
  MessageSquare,
  Smartphone
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "IA Preditiva",
      description: "Algoritmos de machine learning analisam padrões e preveem movimentos do mercado"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Alertas WhatsApp",
      description: "Receba notificações instantâneas no seu celular quando seus triggers forem acionados"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Stop-Loss Inteligente",
      description: "Proteção automática dos seus investimentos com triggers personalizáveis"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Multi-Mercados",
      description: "Monitore ações brasileiras, americanas e criptomoedas em tempo real"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Day Trader",
      content: "Desde que uso o Asset Whisperer, meus lucros aumentaram 340%. Os alertas salvaram minha carteira várias vezes!",
      rating: 5
    },
    {
      name: "Marina Santos",
      role: "Investidora",
      content: "Finalmente posso investir sem ficar grudada no celular. A IA é impressionante!",
      rating: 5
    }
  ];

  const stats = [
    { number: "R$ 2.4M+", label: "Lucros Protegidos" },
    { number: "15,000+", label: "Alertas Enviados" },
    { number: "98.7%", label: "Precisão da IA" },
    { number: "24/7", label: "Monitoramento" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-primary to-accent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-l from-secondary to-primary rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent to-secondary rounded-full blur-3xl animate-glow-pulse"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 px-6 py-2 bg-gradient-to-r from-primary to-accent text-black font-bold animate-shine">
            🔥 OFERTA LIMITADA - 70% OFF
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
            Transforme seus
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              R$ 1.000 em R$ 10.000
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            A primeira plataforma de <span className="text-primary font-bold">Inteligência Artificial</span> que 
            monitora seus investimentos 24/7 e te avisa no WhatsApp quando é hora de 
            <span className="text-accent font-bold"> COMPRAR ou VENDER</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in" style={{animationDelay: '0.4s'}}>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-black font-bold px-8 py-4 text-lg warm-glow transition-all duration-300 hover:scale-105">
              <Link to="/auth">
                <DollarSign className="mr-2 h-5 w-5" />
                COMEÇAR A LUCRAR AGORA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300">
              <MessageSquare className="mr-2 h-5 w-5" />
              Ver Demo Grátis
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>+5.247 traders ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent fill-current" />
              <span>4.9/5 avaliação</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-card to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white">
              TECNOLOGIA EXCLUSIVA
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Por que 99% dos Traders
              <br />
              <span className="text-foreground">Perdem Dinheiro?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Porque eles não têm uma <span className="text-primary font-bold">IA trabalhando 24/7</span> para eles. 
              Enquanto você dorme, nossa IA está <span className="text-accent font-bold">protegendo e multiplicando</span> seu patrimônio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-effect warm-glow hover:intense-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-black animate-glow-pulse">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20 bg-gradient-to-r from-secondary/20 to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="h-6 w-6 text-accent" />
              <Badge className="bg-destructive text-white px-4 py-2 animate-glow-pulse">
                ÚLTIMAS 48 HORAS
              </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
                ATENÇÃO:
              </span>
              <br />
              O mercado não espera por você!
            </h2>
            
            <p className="text-xl mb-8 text-muted-foreground">
              Enquanto você está pensando, outros já estão 
              <span className="text-primary font-bold"> lucrando R$ 1.000+ por dia</span> com nossa IA. 
              <br />
              <span className="text-accent font-bold">Não seja o último a descobrir!</span>
            </p>

            <div className="bg-gradient-to-r from-primary to-accent p-1 rounded-xl inline-block mb-8">
              <div className="bg-background rounded-lg px-8 py-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  Apenas R$ 97/mês
                </div>
                <div className="text-lg text-muted-foreground line-through">
                  De: R$ 297/mês
                </div>
                <div className="text-sm text-accent font-bold">
                  ECONOMIA DE R$ 2.400 POR ANO
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-accent to-primary hover:from-primary hover:to-accent text-black font-bold px-12 py-6 text-xl intense-glow animate-glow-pulse">
              <Zap className="mr-2 h-6 w-6" />
              GARANTIR DESCONTO AGORA
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Resultados Reais de
              <br />
              Clientes Reais
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass-effect warm-glow animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-lg mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-bold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Pare de Perder Dinheiro.
              </span>
              <br />
              Comece a Lucrar Hoje!
            </h2>
            
            <p className="text-xl mb-8 text-muted-foreground">
              Junte-se aos <span className="text-primary font-bold">5.247 traders</span> que já transformaram 
              suas vidas financeiras com nossa IA
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>✅ Setup em 2 minutos</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>✅ Garantia de 30 dias</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span>✅ Suporte 24/7</span>
              </div>
            </div>

            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-black font-bold px-12 py-6 text-xl intense-glow animate-glow-pulse">
              <Link to="/auth">
                <Smartphone className="mr-2 h-6 w-6" />
                ATIVAR MINHA IA AGORA
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              🔒 Pagamento 100% seguro • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;