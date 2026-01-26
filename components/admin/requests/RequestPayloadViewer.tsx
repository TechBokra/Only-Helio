
import React, { useMemo } from 'react';
import { Request, RequestType } from '../../../types';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';

interface RequestPayloadViewerProps {
    request: Request;
}

const RequestPayloadViewer: React.FC<RequestPayloadViewerProps> = ({ request }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;

    const { payload, type } = request;
    
    // Safety check for payload
    if (!payload) return <div className="text-gray-500 italic">No payload data available.</div>;

    // Helper to extract structured data from flattened notes
    const parseStructuredNotes = (notes: string | undefined) => {
        if (!notes) return { structured: [], remaining: '' };
        
        const lines = notes.split('\n');
        const structured: { label: string, value: string }[] = [];
        const remainingLines: string[] = [];
        
        let isParsingHeaders = true;

        lines.forEach(line => {
            const trimLine = line.trim();
            // Check for Key: Value pattern, but exclude "--- Notes ---" divider
            if (isParsingHeaders && trimLine.includes(':') && !trimLine.startsWith('---')) {
                const [key, ...rest] = trimLine.split(':');
                structured.push({ label: key.trim(), value: rest.join(':').trim() });
            } else if (trimLine.startsWith('--- Notes ---')) {
                isParsingHeaders = false; // Stop parsing headers after divider
            } else if (trimLine.length > 0) {
                remainingLines.push(trimLine);
            }
        });

        return { structured, remaining: remainingLines.join('\n') };
    };

    switch (type) {
        case RequestType.PARTNER_APPLICATION:
            const p = payload as any;
            return (
                <div className="space-y-4 animate-fadeIn">
                    <DetailItem label="Company" value={p.companyName} />
                    <DetailItem label="Type" value={p.companyType} />
                    <DetailItem label="Website" value={p.website ? <a href={p.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{p.website}</a> : 'N/A'} />
                    <DetailItem label="Address" value={p.companyAddress} />
                    <DetailItem label="Description" value={<p className="whitespace-pre-line">{p.description}</p>} />
                    
                    {p.managementContacts && p.managementContacts.length > 0 && (
                         <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Management Contacts</h5>
                            <ul className="space-y-2">
                                {p.managementContacts.map((contact: any, idx: number) => (
                                    <li key={idx} className="text-sm">
                                        <span className="font-semibold">{contact.name}</span> ({contact.position}) - {contact.email}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {p.documents && p.documents.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">{t_admin.table.documents}</p>
                            <ul className="list-disc list-inside text-sm text-blue-600">
                                {p.documents.map((doc: any, i: number) => (
                                    <li key={i}><a href={doc.fileContent} download={doc.fileName}>{doc.fileName}</a></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );

        case RequestType.PROPERTY_LISTING_REQUEST:
            const r = payload as any;
            const pd = r.propertyDetails || {};
            
            // Helper for safe language access
            const safeLang = (obj: any) => obj?.[language] || obj?.en || 'N/A';

            return (
                <div className="space-y-6 animate-fadeIn">
                    {Object.keys(pd).length === 0 ? (
                        <div className="text-red-500">Missing property details data.</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="Property Type" value={safeLang(pd.propertyType)} />
                                <DetailItem label="Purpose" value={safeLang(pd.purpose)} />
                                <DetailItem label="Area" value={pd.area ? `${pd.area} m²` : 'N/A'} />
                                <DetailItem label="Price" value={pd.price ? `EGP ${Number(pd.price).toLocaleString()}` : 'N/A'} />
                                <DetailItem label="Finishing" value={safeLang(pd.finishingStatus)} />
                                <DetailItem label="Cooperation" value={r.cooperationType} />
                            </div>
                            
                            <DetailItem label="Address" value={pd.address} />
                            <DetailItem label="Description" value={<p className="whitespace-pre-line text-sm">{pd.description}</p>} />
                        </>
                    )}

                    {r.images && r.images.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Images</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {r.images.map((img: string, idx: number) => (
                                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="block aspect-video">
                                        <img src={img} alt={`Property ${idx + 1}`} className="w-full h-full object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );

        case RequestType.LEAD:
            const l = payload as any;
            const { structured, remaining } = parseStructuredNotes(l.customerNotes);
            
            return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem label="Service Type" value={l.serviceType} />
                        <DetailItem label="Partner ID" value={l.partnerId} />
                        <DetailItem label="Manager ID" value={l.managerId || 'N/A'} />
                        <DetailItem label="Preferred Time" value={l.contactTime} />
                    </div>
                    <DetailItem label="Service Title" value={l.serviceTitle} />
                    
                    {/* Render structured details extracted from notes (For Finishing/Decor Requests) */}
                    {structured.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b pb-2">
                                Request Specifications
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {structured.map((item, idx) => (
                                    <div key={idx}>
                                        <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Reference Image */}
                    {l.referenceImage && (
                        <div>
                             <p className="text-sm font-medium text-gray-500 mb-2">Reference Attachment</p>
                             <a href={l.referenceImage} target="_blank" rel="noreferrer" className="inline-block">
                                 <img src={l.referenceImage} alt="Reference" className="w-48 h-auto rounded-lg border hover:opacity-90 transition-opacity"/>
                             </a>
                        </div>
                    )}

                    {/* Remaining plain text notes */}
                    {remaining && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md border border-yellow-200 dark:border-yellow-800/30">
                            <DetailItem label="Additional Notes" value={<p className="whitespace-pre-wrap">{remaining}</p>} />
                        </div>
                    )}
                </div>
            );

        case RequestType.CONTACT_MESSAGE:
             const c = payload as any;
             return (
                 <div className="space-y-4 animate-fadeIn">
                     <DetailItem label="Inquiry Type" value={c.inquiryType} />
                     {c.companyName && <DetailItem label="Company Name" value={c.companyName} />}
                     {c.businessType && <DetailItem label="Business Type" value={c.businessType} />}
                     <div className="pt-2">
                        <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                        <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-line">{c.message}</p>
                     </div>
                 </div>
             );

        case RequestType.PROPERTY_INQUIRY:
            const i = payload as any;
            return (
                <div className="space-y-4 animate-fadeIn">
                    <DetailItem label="Inquiry Details" value={<p className="whitespace-pre-line">{i.details}</p>} />
                </div>
            );

        default:
            return (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md font-mono text-xs overflow-auto max-h-60">
                    <pre>{JSON.stringify(payload, null, 2)}</pre>
                </div>
            );
    }
};

export default RequestPayloadViewer;
