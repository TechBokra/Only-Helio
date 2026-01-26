
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../services/leads';
import { getAllProperties } from '../../services/properties';
import { getAllPartnersForAdmin } from '../../services/partners';
import { exportToCsv, exportToPdf } from '../../utils/exportUtils';
import { inputClasses, selectClasses } from '../ui/FormField';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
    ChartBarIcon, FileDownloadIcon, FunnelIcon, TableCellsIcon, 
    CalendarIcon, ArrowDownIcon, RefreshIcon, FilterIcon 
} from '../ui/Icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { StatusBadge } from '../ui/StatusBadge';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type DataSourceType = 'leads' | 'properties' | 'partners';
type DateRangeShortcut = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';

interface FormData {
    dataSource: DataSourceType;
    columns: string[];
    dateRangeShortcut: DateRangeShortcut;
    startDate: string;
    endDate: string;
    statusFilter: string;
}

const AdminReportsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const t_reports = t.adminReports;
    
    // Toggle state for column selector visibility
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const { register, watch, setValue } = useForm<FormData>({
        defaultValues: {
            dataSource: 'leads',
            columns: [],
            dateRangeShortcut: 'month',
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            statusFilter: 'all'
        }
    });

    const dataSource = watch('dataSource') || 'leads';
    const selectedColumns = watch('columns');
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const statusFilter = watch('statusFilter');
    const dateRangeShortcut = watch('dateRangeShortcut');

    // Fetch Data
    const { data: leads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads });
    const { data: properties, isLoading: loadingProps } = useQuery({ queryKey: ['allPropertiesAdmin'], queryFn: getAllProperties });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });

    const loading = loadingLeads || loadingProps || loadingPartners;

    // Configuration Definitions
    const columnDefinitions: Record<DataSourceType, Record<string, { label: string, path: string }>> = {
        leads: {
            customerName: { label: 'Customer Name', path: 'customerName' },
            customerPhone: { label: 'Phone', path: 'customerPhone' },
            serviceTitle: { label: 'Service', path: 'serviceTitle' },
            status: { label: 'Status', path: 'status' },
            createdAt: { label: 'Date', path: 'createdAt' },
            partnerName: { label: 'Partner', path: 'partnerName' }
        },
        properties: {
            title: { label: 'Title', path: `title.${language}` },
            type: { label: 'Type', path: `type.${language}` },
            status: { label: 'Status', path: 'listingStatus' },
            price: { label: 'Price', path: 'priceNumeric' },
            area: { label: 'Area', path: 'area' },
            location: { label: 'Location', path: `address.${language}` },
            partner: { label: 'Partner', path: 'partnerName' }
        },
        partners: {
            name: { label: 'Name', path: language === 'ar' ? 'nameAr' : 'name' },
            type: { label: 'Type', path: 'type' },
            email: { label: 'Email', path: 'email' },
            status: { label: 'Status', path: 'status' },
            plan: { label: 'Plan', path: 'subscriptionPlan' },
            joined: { label: 'Joined', path: 'createdAt' } 
        }
    };

    // Helper to handle Date Range Shortcuts
    const handleDateShortcut = (shortcut: DateRangeShortcut) => {
        const end = new Date();
        let start = new Date();
        
        switch (shortcut) {
            case 'today': start = end; break;
            case 'week': start.setDate(end.getDate() - 7); break;
            case 'month': start.setMonth(end.getMonth() - 1); break;
            case 'quarter': start.setMonth(end.getMonth() - 3); break;
            case 'year': start.setFullYear(end.getFullYear() - 1); break;
            case 'all': start = new Date('2020-01-01'); break;
        }
        
        setValue('startDate', start.toISOString().split('T')[0]);
        setValue('endDate', end.toISOString().split('T')[0]);
        setValue('dateRangeShortcut', shortcut);
    };

    // Helper to Select All Columns
    const handleSelectAllColumns = () => {
        const colDefs = columnDefinitions[dataSource];
        if (!colDefs) return;
        const allCols = Object.keys(colDefs);
        if (selectedColumns.length === allCols.length) {
            setValue('columns', []);
        } else {
            setValue('columns', allCols);
        }
    };

    // Set default columns on datasource change
    React.useEffect(() => {
        const currentDefs = columnDefinitions[dataSource];
        if (currentDefs) {
             const defaultCols = Object.keys(currentDefs);
             setValue('columns', defaultCols);
        }
    }, [dataSource, setValue]);

    // Filter Logic
    const filteredData = useMemo(() => {
        let data: any[] = [];
        if (dataSource === 'leads') data = leads || [];
        else if (dataSource === 'properties') data = properties || [];
        else if (dataSource === 'partners') data = partners || [];

        if (!data) return [];

        return data.filter(item => {
            // Date Filter
            const dateField = dataSource === 'properties' ? 'listingStartDate' : 'createdAt';
            const itemDateStr = (item as any)[dateField];
            const itemDate = itemDateStr ? new Date(itemDateStr) : new Date(0);
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59); 

            const dateMatch = itemDate >= start && itemDate <= end;

            // Status Filter
            let statusMatch = true;
            if (statusFilter !== 'all') {
                const statusField = dataSource === 'properties' ? 'listingStatus' : 'status';
                const statusValue = (item as any)[statusField];
                statusMatch = statusValue === statusFilter;
            }

            return dateMatch && statusMatch;
        });
    }, [dataSource, leads, properties, partners, startDate, endDate, statusFilter]);

    // Analytics & Charts Data
    const analytics = useMemo(() => {
        if (!filteredData.length) return null;

        // 1. Status Distribution
        const statusCounts: Record<string, number> = {};
        // 2. Timeline Data (Trend)
        const timelineData: Record<string, number> = {};

        filteredData.forEach(item => {
            // Status
            const statusField = dataSource === 'properties' ? 'listingStatus' : 'status';
            const status = (item as any)[statusField] || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            // Timeline
            const dateField = dataSource === 'properties' ? 'listingStartDate' : 'createdAt';
            const dateStr = (item as any)[dateField];
            if (dateStr) {
                const dateKey = new Date(dateStr).toISOString().split('T')[0];
                timelineData[dateKey] = (timelineData[dateKey] || 0) + 1;
            }
        });

        const sortedDates = Object.keys(timelineData).sort();
        
        return {
            total: filteredData.length,
            statusDistribution: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#8B5CF6'],
                    borderWidth: 0
                }]
            },
            timeline: {
                labels: sortedDates,
                datasets: [{
                    label: 'Count',
                    data: sortedDates.map(d => timelineData[d]),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        };
    }, [filteredData, dataSource]);

    const handleExport = (type: 'csv' | 'pdf') => {
        if (selectedColumns.length === 0) {
            showToast(t_reports.noColumnsSelected, 'error');
            return;
        }
        
        const currentDefs = columnDefinitions[dataSource];
        if (!currentDefs) return;

        const columnsToExport = selectedColumns.reduce((acc, key) => {
            acc[key] = currentDefs[key]?.label || key;
            return acc;
        }, {} as Record<string, string>);

        const flatData = filteredData.map(item => {
            const row: any = {};
            selectedColumns.forEach(colKey => {
                const path = currentDefs[colKey]?.path;
                row[colKey] = path ? path.split('.').reduce((o, i) => o?.[i], item) : '';
            });
            return row;
        });

        const filename = `${dataSource}_report_${new Date().toISOString().split('T')[0]}`;

        if (type === 'csv') {
            exportToCsv(filename, columnsToExport, flatData);
        } else {
            exportToPdf(filename, columnsToExport, flatData, language);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            
            {/* 1. Header & Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_reports.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_reports.subtitle}</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={() => handleExport('csv')} variant="secondary" className="flex items-center gap-2">
                         <FileDownloadIcon className="w-4 h-4" /> CSV
                     </Button>
                     <Button onClick={() => handleExport('pdf')} variant="primary" className="flex items-center gap-2">
                         <FileDownloadIcon className="w-4 h-4" /> PDF
                     </Button>
                </div>
            </div>

            {/* 2. Top Control Bar (Filters) */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    
                    {/* Data Source */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Data Source</label>
                        <select {...register('dataSource')} className={selectClasses + " font-medium"}>
                            <option value="leads">{t_reports.dataSources.leads}</option>
                            <option value="properties">{t_reports.dataSources.properties}</option>
                            <option value="partners">{t_reports.dataSources.partners}</option>
                        </select>
                    </div>

                    {/* Date Presets */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Time Range</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {['week', 'month', 'year', 'all'].map((sc) => (
                                <button 
                                    key={sc}
                                    type="button"
                                    onClick={() => handleDateShortcut(sc as DateRangeShortcut)}
                                    className={`flex-1 text-xs py-2 rounded-md transition-all font-medium ${dateRangeShortcut === sc ? 'bg-white dark:bg-gray-600 shadow text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    {sc.charAt(0).toUpperCase() + sc.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                         <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status Filter</label>
                         <div className="relative">
                             <select {...register('statusFilter')} className={selectClasses}>
                                 <option value="all">All Statuses</option>
                                 {dataSource === 'properties' ? (
                                     <>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="draft">Draft</option>
                                     </>
                                 ) : dataSource === 'leads' ? (
                                     <>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                     </>
                                 ) : (
                                     <>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                     </>
                                 )}
                             </select>
                             <FilterIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    {/* Columns Toggle */}
                    <div className="relative">
                         <Button type="button" variant="outline" className="w-full justify-between" onClick={() => setShowColumnSelector(!showColumnSelector)}>
                            <span>Customize Columns ({selectedColumns.length})</span>
                            <ArrowDownIcon className={`w-4 h-4 transition-transform ${showColumnSelector ? 'rotate-180' : ''}`} />
                         </Button>
                         
                         {showColumnSelector && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4 animate-fadeIn">
                                 <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                     <span className="text-xs font-bold text-gray-500 uppercase">Visible Columns</span>
                                     <button type="button" onClick={handleSelectAllColumns} className="text-xs text-amber-600 hover:underline">Toggle All</button>
                                 </div>
                                 <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                    {columnDefinitions[dataSource] && Object.entries(columnDefinitions[dataSource]).map(([key, def]) => (
                                        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                                            <Checkbox {...register('columns')} value={key} />
                                            {/* @ts-ignore */}
                                            <span className="text-gray-700 dark:text-gray-300">{(def as any).label}</span>
                                        </label>
                                    ))}
                                 </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* 3. Visual Insights Dashboard (KPIs & Charts) */}
            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KPI Card */}
                    <Card className="lg:col-span-1 bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-amber-100 font-medium text-sm uppercase tracking-wider mb-2">Total Records</p>
                                <h2 className="text-5xl font-bold">{analytics.total}</h2>
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/20">
                                <p className="text-sm text-white/90 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" /> 
                                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Doughnut Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-gray-500">Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex justify-center pb-4">
                            <Doughnut data={analytics.statusDistribution} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }} />
                        </CardContent>
                    </Card>

                    {/* Line Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-gray-500">Growth Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 pb-4">
                            <Line data={analytics.timeline} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { count: 3 } } } }} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 4. Data Table */}
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TableCellsIcon className="w-5 h-5 text-gray-400" />
                            Detailed Data
                        </CardTitle>
                        <span className="text-xs text-gray-500">Showing {filteredData.length} records</span>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                            Loading data...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 bg-gray-50/50">
                            No records found matching your filters.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {selectedColumns.length > 0 ? selectedColumns.map(colKey => {
                                        // @ts-ignore
                                        const label = columnDefinitions[dataSource][colKey]?.label || colKey;
                                        return <TableHead key={colKey} className="whitespace-nowrap bg-gray-50 dark:bg-gray-800 font-bold">{label}</TableHead>;
                                    }) : <TableHead>No columns selected</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.slice(0, 100).map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors border-b border-gray-100 dark:border-gray-800">
                                         {selectedColumns.map(colKey => {
                                             // @ts-ignore
                                             const path = columnDefinitions[dataSource][colKey]?.path;
                                             const value = path ? path.split('.').reduce((o: any, i: any) => o?.[i], item) : '';
                                             
                                             let content: React.ReactNode = value;
                                             
                                             // Special Rendering
                                             if (colKey === 'status' || colKey.includes('Status')) {
                                                 content = <StatusBadge status={value} className="text-[10px]" />;
                                             } else if (colKey === 'createdAt' || colKey.includes('Date')) {
                                                 content = new Date(value).toLocaleDateString(language);
                                             } else if (colKey === 'price') {
                                                 content = typeof value === 'number' ? value.toLocaleString() : value;
                                             }

                                             return (
                                                <TableCell key={colKey} className="whitespace-nowrap text-sm py-3 text-gray-700 dark:text-gray-300">
                                                    {content}
                                                </TableCell>
                                             );
                                         })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
                 {filteredData.length > 100 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                        Showing first 100 rows. Use <strong>Export</strong> to see all data.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminReportsPage;
