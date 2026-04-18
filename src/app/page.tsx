import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const features = [
  {
    title: "Быстрая скорость",
    description: "Мгновенная обработка данных с помощью передовых технологий.",
    icon: "⚡",
  },
  {
    title: "Безопасность",
    description: "Ваши данные защищены с помощью шифрования уровня enterprise.",
    icon: "🔒",
  },
  {
    title: "Масштабируемость",
    description: "Легко масштабируйте ваш бизнес без ограничений.",
    icon: "📈",
  },
];

const testimonials = [
  {
    name: "Анна Петрова",
    role: "CEO, TechStart",
    content: "Этот продукт полностью изменил наш подход к работе. Рекомендую!",
  },
  {
    name: "Иван Сидоров",
    role: "CTO, InnovateLab",
    content: "Лучшее решение на рынке. Окупилось за первый месяц использования.",
  },
  {
    name: "Мария Иванова",
    role: "Product Manager, GrowthCo",
    content: "Простота использования и отличная поддержка. Превосходно!",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">ProductName</div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary">Функции</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary">Отзывы</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary">Контакты</a>
          </nav>
          <Button>Начать</Button>
        </div>
      </header>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Ускорьте свой бизнес с нашим продуктом
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Инструмент нового поколения, который поможет вам достичь целей быстрее и эффективнее.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Попробовать бесплатно</Button>
            <Button size="lg" variant="outline">Узнать больше</Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-lg mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Свяжитесь с нами</h2>
            <p className="text-center text-muted-foreground mb-8">
              Оставьте заявку, и мы свяжемся с вами
            </p>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div>
                    <Input placeholder="Ваше имя" />
                  </div>
                  <div>
                    <Input type="email" placeholder="Email" />
                  </div>
                  <div>
                    <Textarea placeholder="Сообщение" rows={4} />
                  </div>
                  <Button className="w-full" size="lg">Отправить</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 ProductName. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}