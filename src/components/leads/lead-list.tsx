'use client';

import { useState } from 'react';
import { Plus, Phone, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLeads, leadAPI } from '@/services/lead';
import { Lead } from '@/interfaces/lead';
import LeadForm from '@/components/leads/lead-form';
import toast from 'react-hot-toast';

export default function LeadList() {
    const { leads, isLoading, isError, mutate } = useLeads();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const handleEdit = (lead: Lead) => {
        setEditingLead(lead);
        setIsEditOpen(true);
    };

    const handleDelete = async (lead: Lead) => {
        try {
            await leadAPI.delete(lead.id);
            mutate();
            toast.success('Lead deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete lead');
        }
    };

    const handleCall = (phone: string) => {
        // For now, just open the phone dialer or copy to clipboard
        window.open(`tel:${phone}`, '_self');
    };

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        mutate();
    };

    const handleEditSuccess = () => {
        setIsEditOpen(false);
        setEditingLead(null);
        mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading leads...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading leads</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Leads</CardTitle>
                            <CardDescription>
                                Manage your leads and contact information
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Lead</DialogTitle>
                                    <DialogDescription>
                                        Create a new lead with contact information
                                    </DialogDescription>
                                </DialogHeader>
                                <LeadForm onSuccess={handleCreateSuccess} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {leads && leads.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                        <TableCell>{lead.phone}</TableCell>
                                        <TableCell>{lead.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCall(lead.phone)}
                                                >
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    Call Now
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(lead)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete
                                                                the lead &quot;{lead.name}&quot; from your account.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(lead)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No leads found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Start by adding your first lead
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                        <DialogDescription>
                            Update the lead information
                        </DialogDescription>
                    </DialogHeader>
                    {editingLead && (
                        <LeadForm
                            lead={editingLead}
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 