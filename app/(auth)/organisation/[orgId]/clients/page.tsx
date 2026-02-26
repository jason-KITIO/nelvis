"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/services";
import type { Client, ClientStatut } from "@/types/client";
import {
  Users,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { EditClientDialog } from "@/components/clients/edit-client-dialog";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { ClientDetailsDialog } from "@/components/clients/client-details-dialog";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

function DroppableColumn({ statut, children }: { statut: ClientStatut; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });
  return (
    <div ref={setNodeRef} className={`min-h-[200px] ${isOver ? "bg-accent/50" : ""}`}>
      {children}
    </div>
  );
}

function DraggableClient({ client, orgId }: { client: Client; orgId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: client.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 mb-2 bg-card border rounded-lg cursor-move hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-sm">{client.nom}</p>
          <p className="text-xs text-muted-foreground">{client.email}</p>
          <Badge variant={client.type === "B2B" ? "default" : "secondary"} className="mt-1 text-xs">
            {client.type}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ClientDetailsDialog
              client={client}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  Détails
                </DropdownMenuItem>
              }
            />
            <EditClientDialog
              orgId={orgId}
              client={client}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              }
            />
            <DeleteClientDialog
              orgId={orgId}
              clientId={client.id}
              clientName={client.nom}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "pipeline">("table");
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data, isLoading } = useQuery({
    queryKey: ["clients", orgId],
    queryFn: () => clientService.getAll(orgId),
  });

  const updateStatutMutation = useMutation({
    mutationFn: ({ clientId, statut }: { clientId: string; statut: ClientStatut }) =>
      clientService.update(orgId, clientId, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
    },
  });

  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    return data.clients.filter(
      (client: Client) =>
        client.nom.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.siret?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const clientsByStatut = useMemo(() => {
    const statuts: ClientStatut[] = ["PROSPECT", "PROPOSE", "NEGOCIE", "GAGNE", "PERDU"];
    return statuts.reduce((acc, statut) => {
      acc[statut] = filteredClients.filter((c: Client) => (c.statut || "PROSPECT") === statut);
      return acc;
    }, {} as Record<ClientStatut, Client[]>);
  }, [filteredClients]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;
    
    const clientId = active.id as string;
    const newStatut = over.id as ClientStatut;
    
    updateStatutMutation.mutate({ clientId, statut: newStatut });
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const activeClient = activeId ? filteredClients.find((c: Client) => c.id === activeId) : null;

  const getStatutBadge = (statut?: ClientStatut) => {
    const s = statut || "PROSPECT";
    const config = {
      PROSPECT: { label: "Prospect", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      PROPOSE: { label: "Proposé", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
      NEGOCIE: { label: "Négocié", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
      GAGNE: { label: "Gagné", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      PERDU: { label: "Perdu", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    };
    return <Badge className={config[s].className}>{config[s].label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gérez vos clients</p>
        </div>
        {!isLoading && data?.clients.length !== 0 && (
          <AddClientDialog orgId={orgId} />
        )}
      </div>

      {!isLoading && data?.clients.length !== 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou SIRET..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {isLoading ? (
        <div>Chargement...</div>
      ) : data?.clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun client</h2>
          <p className="text-muted-foreground mb-6">
            Commencez par ajouter votre premier client
          </p>
          <AddClientDialog orgId={orgId} />
        </div>
      ) : (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "grid" | "pipeline")}>
          <TabsList>
            <TabsTrigger value="table">Tableau</TabsTrigger>
            <TabsTrigger value="grid">Grille</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nom}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={client.type === "B2B" ? "default" : "secondary"}
                    >
                      {client.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatutBadge(client.statut)}</TableCell>
                  <TableCell>{client.siret || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ClientDetailsDialog
                          client={client}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Détails
                            </DropdownMenuItem>
                          }
                        />
                        <EditClientDialog
                          orgId={orgId}
                          client={client}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          }
                        />
                        <DeleteClientDialog
                          orgId={orgId}
                          clientId={client.id}
                          clientName={client.nom}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          </TabsContent>
          <TabsContent value="grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{client.nom}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <ClientDetailsDialog
                        client={client}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Détails
                          </DropdownMenuItem>
                        }
                      />
                      <EditClientDialog
                        orgId={orgId}
                        client={client}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                        }
                      />
                      <DeleteClientDialog
                        orgId={orgId}
                        clientId={client.id}
                        clientName={client.nom}
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge
                    variant={client.type === "B2B" ? "default" : "secondary"}
                  >
                    {client.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  {getStatutBadge(client.statut)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SIRET</p>
                  <p className="text-sm">{client.siret || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="text-sm">{client.adresse}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>
          <TabsContent value="pipeline">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              <div className="grid gap-4 md:grid-cols-5">
                {(["PROSPECT", "PROPOSE", "NEGOCIE", "GAGNE", "PERDU"] as ClientStatut[]).map((statut) => {
                  const label = { PROSPECT: "Prospect", PROPOSE: "Proposé", NEGOCIE: "Négocié", GAGNE: "Gagné", PERDU: "Perdu" }[statut];
                  return (
                    <Card key={statut}>
                      <CardHeader>
                        <CardTitle className="text-sm flex justify-between items-center">
                          {label}
                          <Badge variant="outline" className="ml-2">{clientsByStatut[statut]?.length || 0}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DroppableColumn statut={statut}>
                          {clientsByStatut[statut]?.length > 0 ? (
                            clientsByStatut[statut].map((client: Client) => (
                              <DraggableClient key={client.id} client={client} orgId={orgId} />
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">Aucun client</p>
                          )}
                        </DroppableColumn>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <DragOverlay>
                {activeClient ? (
                  <div className="p-3 bg-card border rounded-lg shadow-lg">
                    <p className="font-medium text-sm">{activeClient.nom}</p>
                    <p className="text-xs text-muted-foreground">{activeClient.email}</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
