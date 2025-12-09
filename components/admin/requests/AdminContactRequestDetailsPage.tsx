
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContactMessageById, updateMessageStatus } from '../../../services/messages';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { ArrowLeftIcon, PhoneIcon, InboxIcon } from '../../ui/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import DetailItem from '../../shared/DetailItem';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { RequestStatus } from '../../../types';

const AdminContactRequestDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const { data: message, isLoading } = useQuery({
        queryKey: ['contactMessage', id],
        queryFn: () => getContactMessageById(id!),
        enabled: !!id
    });

    const [status, setStatus] = useState<RequestStatus>('new');

    useEffect(() => {
        if (message) {
            setStatus(message.status);
        }
    }, [message]);

    const mutation = useMutation({
        mutationFn: (newStatus: RequestStatus) => updateMessageStatus(id!, newStatus),
        onSuccess: (_, newStatus) => {
            showToast('Status updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['contactMessage', id] });
            queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
        },
        onError: () => showToast('Failed to update status', 'error')
    });

    if (isLoading) return <div className="p-8 text-center">Loading message...</div>;
    if (!message) return <div className="p-8 text-center text-red-500">Message not found.</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <Link to="/admin/communication/messages" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-6">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Messages
            </Link>

            <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Message</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${message.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {message.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Message Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <InboxIcon className="w-6 h-6 text-amber-500" />
                                <CardTitle>Message Content</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                                    {message.message}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-right">
                                Sent on: {new Date(message.createdAt).toLocaleString(language)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Sender Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="Name" value={message.name} />
                            <DetailItem label="Phone" value={message.phone} icon={<PhoneIcon className="w-4 h-4"/>} />
                            <DetailItem label="Email" value={message.email || 'N/A'} />
                            <DetailItem label="Inquiry Type" value={message.inquiryType} className="capitalize" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Management</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Update Status</label>
                                <Select 
                                    value={status} 
                                    onChange={(e) => {
                                        setStatus(e.target.value as RequestStatus);
                                        mutation.mutate(e.target.value as RequestStatus);
                                    }}
                                >
                                    <option value="new">New</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="closed">Closed</option>
                                </Select>
                            </div>
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <a href={`tel:${message.phone}`} className="block w-full">
                                    <Button variant="outline" className="w-full justify-center">
                                        <PhoneIcon className="w-4 h-4 mr-2"/> Call Sender
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminContactRequestDetailsPage;
