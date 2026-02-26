"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Search,
  Plus,
  LayoutGrid,
  LayoutList,
  ArrowRight,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAppSidebar } from "@/components/organisation/org-app-sidebar";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useOrganisations,
  useUpdateOrganisation,
  useDeleteOrganisation,
} from "@/hooks";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/guards";
import { useRouter } from "next/navigation";

export default function OrganizationPage() {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useOrganisations();
  const updateOrg = useUpdateOrganisation();
  const deleteOrg = useDeleteOrganisation();
  const router = useRouter();

  const organizations = data?.organisations || [];
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.siret?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isLoading && organizations.length === 0) {
      router.push("/onboarding");
    }
  }, [isLoading, organizations.length, router]);

  const handleEdit = (orgId: string) => {
    // TODO: Ouvrir modal d'édition
    console.log("Éditer", orgId);
  };

  const handleDeleteClick = (orgId: string) => {
    setSelectedOrgId(orgId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrgId) return;
    try {
      await deleteOrg.mutateAsync({ orgId: selectedOrgId });
      setDeleteDialogOpen(false);
      setSelectedOrgId(null);

      // Rediriger vers onboarding si plus d'organisations
      if (organizations.length === 1) {
        window.location.href = "/onboarding";
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <OrgAppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Organisations</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Organisations
                </h1>
                <p className="text-muted-foreground">
                  Gérez vos entités et leurs abonnements.
                </p>
              </div>
              {!isLoading && organizations.length > 0 && (
                <div className="flex gap-2">
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "card" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="bg-primary hover:opacity-90 transition-opacity" onClick={() => router.push('/onboarding')}>
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Organisation
                  </Button>
                </div>
              )}
            </div>

            {!isLoading && organizations.length > 0 && (
              <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border">
                <Search className="ml-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une organisation..."
                  className="border-none focus-visible:ring-0 shadow-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : organizations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 bg-muted/50 rounded-full mb-4">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune organisation
                </h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre première organisation
                </p>
                <Button onClick={() => router.push('/onboarding')}>
                  <Plus className="mr-2 h-4 w-4" /> Créer une organisation
                </Button>
              </div>
            ) : viewMode === "table" ? (
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px]">Nom</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Pays</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow
                        key={org.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="h-8 w-8 object-cover border-0"
                            />
                          ) : (
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          {org.name}
                        </TableCell>
                        <TableCell>{org.adresse}</TableCell>
                        <TableCell>{org.pays}</TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-600/10 text-green-600 hover:bg-green-600/20"
                          >
                            {org.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/organisation/${org.id}/dashboard`}>
                              <Button size="sm" variant="ghost">
                                Accéder <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(org.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Éditer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(org.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrganizations.map((org) => (
                  <Card
                    key={org.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="h-12 w-12 object-cover border-0"
                            />
                          ) : (
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              {org.name}
                            </CardTitle>
                            <CardDescription>
                              {org.siret || "Pas de SIRET"}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-600/10 text-green-600 hover:bg-green-600/20"
                        >
                          {org.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Adresse</span>
                        <span className="font-medium">{org.adresse}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pays</span>
                        <span className="font-mono font-medium">
                          {org.pays}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(org.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Link href={`/organisation/${org.id}/dashboard`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> Détails
                          </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(org.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;organisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette organisation ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteOrg.isPending}
            >
              {deleteOrg.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
