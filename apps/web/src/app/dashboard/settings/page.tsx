import { requireUser } from "@/lib/authorization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default async function Page() {
  const user = await requireUser();
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Conta</p>
        <h1 className="text-2xl font-semibold">Configurações</h1>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Sua identidade nos registros.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome</Label>
                <Input
                  id="profile-name"
                  defaultValue={user.name ?? ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  defaultValue={user.email ?? ""}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                As senhas usam bcrypt e as sessões de produção usam cookies
                seguros e HttpOnly.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Navegador atual · Ativo agora</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
