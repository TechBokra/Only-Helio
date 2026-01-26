
import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { LeadMessage } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './ToastContext';
import { addMessageToLead } from '../../services/requests';
import { useLanguage } from './LanguageContext';
import { Role } from '../../types';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

// Relaxed interface to support any request type
interface ConversationThreadProps {
  lead: { 
      id: string; 
      messages?: LeadMessage[]; 
      contactTime?: string; 
      customerNotes?: string;
      [key: string]: any; 
  };
  requestId: string;
  onMessageSent: () => void;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ lead, requestId, onMessageSent }) => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    
    const [newMessage, setNewMessage] = useState('');
    const [messageType, setMessageType] = useState<'message' | 'note'>('note');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const messages = lead.messages || [];

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const mutation = useMutation({
        mutationFn: (messageData: Omit<LeadMessage, 'id' | 'timestamp'>) => addMessageToLead(requestId, messageData),
        onSuccess: () => {
            setNewMessage('');
            onMessageSent();
        },
        onError: () => {
            showToast('Failed to send message.', 'error');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;
        
        const senderType = currentUser.role === Role.SUPER_ADMIN || currentUser.role.includes('_manager') ? 'admin' : 'partner';
        
        mutation.mutate({
            sender: senderType,
            senderId: currentUser.id,
            type: messageType,
            content: newMessage,
        });
    };
    
    const getSenderName = (message: LeadMessage) => {
        if (message.sender === 'client') return 'Client';
        if (message.sender === 'system') return 'System';
        if (message.senderId === currentUser?.id) return 'You';
        
        // @ts-ignore
        const senderInfo = t.partnerInfo?.[message.senderId || ''];
        return senderInfo?.name || message.sender;
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-b-lg flex flex-col h-full overflow-hidden">
            
            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Customer Notes / Specs Section */}
                {(lead.contactTime || lead.customerNotes) && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded shadow-sm text-sm space-y-2">
                        {lead.contactTime && (
                             <div>
                                <span className="font-bold text-yellow-800 dark:text-yellow-300 block text-xs uppercase">{t.dashboard.leadTable.contactTime}</span>
                                <span className="text-yellow-900 dark:text-yellow-200">{lead.contactTime}</span>
                            </div>
                        )}
                        {lead.customerNotes && (
                            <div>
                                <span className="font-bold text-yellow-800 dark:text-yellow-300 block text-xs uppercase">{t.dashboard.leadTable.notes}</span>
                                <div className="text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap mt-1 pl-1 border-l-2 border-yellow-200 dark:border-yellow-700">
                                    {lead.customerNotes}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Divider */}
                {(lead.contactTime || lead.customerNotes) && <div className="border-b border-gray-200 dark:border-gray-700"></div>}

                {/* Messages List */}
                <div className="flex flex-col gap-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-sm text-gray-400 py-4 italic">
                            No additional messages history.
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div 
                                key={msg.id}
                                className={`p-3 rounded-lg max-w-[85%] break-words shadow-sm text-sm
                                    ${msg.type === 'note' ? (msg.sender === 'system' ? 'chat-bubble-note mx-auto text-center text-xs' : 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 self-center w-full') : ''}
                                    ${msg.type !== 'note' && (msg.sender === 'system' ? 'chat-bubble-note mx-auto' : (msg.sender === 'partner' || msg.sender === 'admin' ? 'chat-bubble-sent self-end bg-amber-100 text-amber-900' : 'chat-bubble-received self-start bg-white dark:bg-gray-700'))}
                                `}
                            >
                                <p>{msg.content}</p>
                                <p className={`text-[10px] opacity-70 mt-1 ${msg.type === 'note' || msg.sender === 'system' ? 'text-center' : 'text-right'}`}>
                                    {getSenderName(msg)} • {new Date(msg.timestamp).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Sticky Input Area */}
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 mb-2">
                         {/* Toggle between Note and Message can be added here later */}
                        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Internal Note</span>
                    </div>
                    <div className="flex gap-2">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a note..."
                            className="min-h-[40px] py-2 text-sm resize-none"
                            rows={1}
                            disabled={mutation.isPending}
                        />
                        <Button type="submit" isLoading={mutation.isPending} disabled={!newMessage.trim()} size="sm" className="h-auto">
                            Send
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConversationThread;
