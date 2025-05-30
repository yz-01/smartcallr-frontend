'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { leadAPI } from '@/services/lead';
import { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/interfaces/lead';

const leadSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
});

type LeadForm = z.infer<typeof leadSchema>;

interface LeadFormProps {
    lead?: Lead;
    onSuccess: () => void;
}

export default function LeadForm({ lead, onSuccess }: LeadFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = Boolean(lead);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LeadForm>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            name: lead?.name || '',
            phone: lead?.phone || '',
            email: lead?.email || '',
        },
    });

    const onSubmit = async (data: LeadForm) => {
        setIsLoading(true);
        try {
            if (isEditing && lead) {
                await leadAPI.update(lead.id, data as UpdateLeadRequest);
            } else {
                await leadAPI.create(data as CreateLeadRequest);
            }
            onSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Name
                </label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Enter lead name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                </label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                    ? (isEditing ? 'Updating...' : 'Creating...')
                    : (isEditing ? 'Update Lead' : 'Create Lead')
                }
            </Button>
        </form>
    );
} 