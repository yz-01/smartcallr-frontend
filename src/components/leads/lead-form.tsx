'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { leadAPI } from '@/services/lead';
import { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/interfaces/lead';

const leadSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    countryCode: z.string().min(1, 'Country code is required'),
    phoneNumber: z.string()
        .min(1, 'Phone number is required')
        .regex(/^\d{6,15}$/, 'Phone number must be 6-15 digits'),
    email: z.string().email('Invalid email address'),
});

type LeadForm = z.infer<typeof leadSchema>;

interface LeadFormProps {
    lead?: Lead;
    onSuccess: () => void;
}

// Common country codes
const countryCodes = [
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
];

export default function LeadForm({ lead, onSuccess }: LeadFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = Boolean(lead);

    // Parse existing phone number if editing
    const parsePhone = (phone: string) => {
        if (!phone) return { countryCode: '+60', phoneNumber: '' };

        const match = phone.match(/^(\+\d{1,4})(\d+)$/);
        if (match) {
            return { countryCode: match[1], phoneNumber: match[2] };
        }
        return { countryCode: '+60', phoneNumber: phone.replace(/^\+/, '') };
    };

    const { countryCode: defaultCountryCode, phoneNumber: defaultPhoneNumber } =
        lead ? parsePhone(lead.phone) : { countryCode: '+60', phoneNumber: '' };

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<LeadForm>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            name: lead?.name || '',
            countryCode: defaultCountryCode,
            phoneNumber: defaultPhoneNumber,
            email: lead?.email || '',
        },
    });

    const onSubmit = async (data: LeadForm) => {
        setIsLoading(true);
        try {
            // Combine country code and phone number
            const fullPhone = `${data.countryCode}${data.phoneNumber}`;
            const submitData = {
                name: data.name,
                phone: fullPhone,
                email: data.email,
            };

            if (isEditing && lead) {
                await leadAPI.update(lead.id, submitData as UpdateLeadRequest);
            } else {
                await leadAPI.create(submitData as CreateLeadRequest);
            }
            onSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCountryCode = watch('countryCode');
    const phoneNumber = watch('phoneNumber');
    const previewPhone = selectedCountryCode && phoneNumber ? `${selectedCountryCode}${phoneNumber}` : '';

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
                <label className="text-sm font-medium">
                    Phone Number
                </label>
                <div className="flex gap-2">
                    <div className="w-40">
                        <Select
                            {...register('countryCode')}
                            className={errors.countryCode ? 'border-red-500' : ''}
                        >
                            {countryCodes.map((country, index) => (
                                <option key={`${country.code}-${country.country}-${index}`} value={country.code}>
                                    {country.flag} {country.code} {country.country}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Input
                            type="tel"
                            placeholder="Enter phone number"
                            {...register('phoneNumber')}
                            className={errors.phoneNumber ? 'border-red-500' : ''}
                        />
                    </div>
                </div>
                {previewPhone && (
                    <p className="text-xs text-gray-600">
                        Preview: {previewPhone}
                    </p>
                )}
                {errors.countryCode && (
                    <p className="text-red-500 text-sm">{errors.countryCode.message}</p>
                )}
                {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
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