
// Note: This is a mock API. In a real application, these functions would make network requests
// to a backend service. The data is modified in-memory for simulation purposes.

import { partnersData as initialPartnersData } from '../data/partners';
import type { Partner, PartnerStatus, PartnerRequest, AdminPartner, PartnerType, SubscriptionPlan, PartnerDisplayType } from '../types';
import { mapPartnerTypeToRole } from '../data/permissions';
import { addNotification } from './notifications';
import { arTranslations, enTranslations } from '../data/translations';

// Create a mutable, in-memory copy of the data to simulate a database.
let partnersData: Omit<Partner, 'name' | 'description' | 'role'>[] = [...initialPartnersData];


const SIMULATED_DELAY = 300;

const getPartnerTranslations = () => {
    return {
        ar: arTranslations.partnerInfo,
        en: enTranslations.partnerInfo
    };
};

export const getAllPartners = async (): Promise<Partner[]> => {
    const translations = getPartnerTranslations();
    return partnersData.map(basePartner => {
        const trans = (translations.en as any)[basePartner.id] || { name: basePartner.id, description: '' };
        return {
            ...basePartner,
            ...trans,
            role: mapPartnerTypeToRole(basePartner.type)
        } as Partner;
    });
};

export const getAllPartnersForAdmin = (): Promise<AdminPartner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const translations = getPartnerTranslations();
            
            const result = partnersData.map(basePartner => {
                 const enTrans = (translations.en as any)[basePartner.id] || { name: basePartner.id, description: '' };
                 const arTrans = (translations.ar as any)[basePartner.id] || { name: basePartner.id, description: '' };
                 return {
                     ...basePartner,
                     name: enTrans.name,
                     description: enTrans.description,
                     nameAr: arTrans.name,
                     descriptionAr: arTrans.description,
                     role: mapPartnerTypeToRole(basePartner.type)
                 } as AdminPartner;
            });
            resolve(result);
        }, SIMULATED_DELAY);
    });
};

export const getPartnerById = (id: string): Promise<Partner | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePartner = partnersData.find(p => p.id === id);
      if (!basePartner) {
        resolve(undefined);
        return;
      }
      
      const translations = getPartnerTranslations();
      const enTrans = (translations.en as any)[basePartner.id] || { name: basePartner.id, description: '' };
      resolve({
          ...basePartner,
          ...enTrans,
          role: mapPartnerTypeToRole(basePartner.type)
      } as Partner);
    }, SIMULATED_DELAY);
  });
};

export const getPartnerByEmail = async (email: string): Promise<Partner | undefined> => {
    const basePartner = partnersData.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!basePartner) return undefined;

    const translations = getPartnerTranslations();
    const enTrans = (translations.en as any)[basePartner.id] || { name: basePartner.id, description: '' };
    return {
        ...basePartner,
        ...enTrans,
        role: mapPartnerTypeToRole(basePartner.type)
    } as Partner;
};

export const updatePartner = (id: string, updates: {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    imageUrl?: string;
}): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // This is now a critical limitation of the mock. In a real app, you'd post this to a server
            // which would update the database, and the data would be refetched.
            // For now, we cannot update the imported translations directly.
            // We will just update the partnerData for image changes.
            console.warn("Mock API: Partner text content (name, description) stored in translation files cannot be updated at runtime in this demo.");

            let found = false;
            if (updates.imageUrl) {
                const partnerIndex = partnersData.findIndex(p => p.id === id);
                if (partnerIndex > -1) {
                    const partner = partnersData[partnerIndex] as any;
                    if (partner.imageUrl !== updates.imageUrl) {
                        partner.imageUrl = updates.imageUrl;
                        if (updates.imageUrl.includes('unsplash.com')) {
                             const url = new URL(updates.imageUrl);
                            url.searchParams.set('w', '480'); partner.imageUrl_small = url.toString();
                            url.searchParams.set('w', '800'); partner.imageUrl_medium = url.toString();
                            url.searchParams.set('w', '1200'); partner.imageUrl_large = url.toString();
                        } else {
                            partner.imageUrl_small = updates.imageUrl;
                            partner.imageUrl_medium = updates.imageUrl;
                            partner.imageUrl_large = updates.imageUrl;
                        }
                    }
                    found = true;
                }
            }
            resolve(found);
        }, 300);
    });
};

const updatePartnerProperty = (id: string, property: keyof Partner, value: any): boolean => {
    const partnerIndex = partnersData.findIndex(p => p.id === id);
    if (partnerIndex > -1) {
        (partnersData[partnerIndex] as any)[property] = value;
        return true;
    }
    return false;
};

export const updatePartnerStatus = (id: string, status: PartnerStatus): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(updatePartnerProperty(id, 'status', status)), 300);
    });
};

export const updatePartnerDisplayType = (id: string, displayType: Partner['displayType']): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(updatePartnerProperty(id, 'displayType', displayType)), 300);
    });
};

export const updatePartnerAdmin = (id: string, updates: Partial<Pick<AdminPartner, 'subscriptionPlan' | 'subscriptionEndDate' | 'contactMethods'>>): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let success = false;
            const partnerIndex = partnersData.findIndex(p => p.id === id);
            if (partnerIndex > -1) {
                const partner = partnersData[partnerIndex];
                 partnersData[partnerIndex] = { ...partner, ...updates };
                 success = true;
            }
            resolve(success);
        }, 300);
    });
};

export const upgradePartnerPlan = (id: string, newPlan: SubscriptionPlan): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const partnerIndex = partnersData.findIndex(p => p.id === id);
            if (partnerIndex > -1) {
                partnersData[partnerIndex].subscriptionPlan = newPlan;
                // Extend for 1 year from now for simplicity
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                partnersData[partnerIndex].subscriptionEndDate = nextYear.toISOString();
                
                addNotification({
                    userId: id,
                    message: {
                        ar: `تهانينا! تم ترقية باقتك بنجاح إلى ${newPlan}.`,
                        en: `Congratulations! Your plan has been upgraded to ${newPlan}.`
                    },
                    link: '/dashboard/subscription'
                });

                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

export const addPartner = (request: PartnerRequest): Promise<Partner> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            console.warn("Mock API: Adding a partner in this demo does not persist their translations in the source files. This is a runtime addition only.");
            
            const { companyName, companyType, description, logo, contactEmail, subscriptionPlan } = request;
            const newPartnerId = `partner-${Date.now()}`;

            const newPartnerBaseData: Omit<Partner, 'name' | 'description' | 'role'> = {
                id: newPartnerId,
                imageUrl: logo || 'https://via.placeholder.com/150', // Provide default if undefined
                email: contactEmail,
                password: 'password123', 
                type: companyType,
                status: 'active' as PartnerStatus,
                subscriptionPlan: subscriptionPlan,
                displayType: 'standard', 
            };
            partnersData.push(newPartnerBaseData);
            
            const newPartner: Partner = {
                ...newPartnerBaseData,
                name: companyName,
                description: description,
                role: mapPartnerTypeToRole(companyType)
            };

            addNotification({
                userId: newPartner.id,
                message: {
                    ar: "مرحباً بك! تم الموافقة على حساب الشراكة الخاص بك.",
                    en: "Welcome! Your partner account has been approved.",
                },
                link: '/dashboard',
            });

            resolve(newPartner);
        }, SIMULATED_DELAY);
    });
};

export const addInternalUser = (userData: { name: string, nameAr: string, email: string, password?: string, type: PartnerType }): Promise<AdminPartner> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
             console.warn("Mock API: Adding an internal user does not persist their translations in the source files. This is a runtime addition only.");

            const newUserId = `user-${Date.now()}`;
            const newPartnerBaseData = {
                id: newUserId,
                imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto.format&fit=crop',
                email: userData.email,
                password: userData.password || 'password123',
                type: userData.type,
                status: 'active' as PartnerStatus,
                subscriptionPlan: 'basic' as SubscriptionPlan,
                subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                displayType: 'standard' as PartnerDisplayType,
            };
            partnersData.push(newPartnerBaseData);
            
            const partner = await getPartnerById(newUserId);
            resolve(partner as AdminPartner);
        }, SIMULATED_DELAY);
    });
};

export const updateUser = (userId: string, updates: { name: string, nameAr: string, email: string, type: PartnerType, status: PartnerStatus }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            console.warn("Mock API: Updating user translations does not persist in source files.");
            const partnerIndex = partnersData.findIndex(p => p.id === userId);
            if (partnerIndex > -1) {
                partnersData[partnerIndex] = { ...partnersData[partnerIndex], email: updates.email, type: updates.type, status: updates.status };
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};

export const deletePartner = (userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
             console.warn("Mock API: Deleting a user does not remove them from source files.");
            const initialLength = partnersData.length;
            partnersData = partnersData.filter(p => p.id !== userId);
            if (partnersData.length < initialLength) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
