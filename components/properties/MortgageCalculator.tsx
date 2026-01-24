
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { CalculatorIcon } from '../ui/Icons';

interface MortgageCalculatorProps {
    propertyPrice: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice }) => {
    const { t, language } = useLanguage();
    const t_calc = t.mortgageCalculator;

    const [downPayment, setDownPayment] = useState(propertyPrice * 0.2); // Default 20%
    const [interestRate, setInterestRate] = useState(25); // Default 25% (Realistic for EG currently)
    const [loanTerm, setLoanTerm] = useState(20); // Default 20 years

    const [monthlyPayment, setMonthlyPayment] = useState(0);

    useEffect(() => {
        const principal = propertyPrice - downPayment;
        const calculatedInterest = interestRate / 100 / 12;
        const calculatedPayments = loanTerm * 12;

        if (principal > 0 && interestRate > 0 && loanTerm > 0) {
            const x = Math.pow(1 + calculatedInterest, calculatedPayments);
            const monthly = (principal * x * calculatedInterest) / (x - 1);
            setMonthlyPayment(monthly);
        } else {
            setMonthlyPayment(0);
        }
    }, [propertyPrice, downPayment, interestRate, loanTerm]);

    return (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
            <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <CalculatorIcon className="w-5 h-5" />
                    {t_calc.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{t_calc.propertyPrice}</label>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{propertyPrice.toLocaleString()} {t_calc.currency}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t_calc.downPayment} ({t_calc.currency})</label>
                        <Input 
                            type="number" 
                            value={downPayment} 
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-700 h-9 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t_calc.interestRate}</label>
                        <Input 
                            type="number" 
                            value={interestRate} 
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-700 h-9 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t_calc.loanTerm}</label>
                        <Input 
                            type="number" 
                            value={loanTerm} 
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="bg-gray-50 dark:bg-gray-700 h-9 text-sm"
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t_calc.monthlyPayment}</p>
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-500">
                        {Math.round(monthlyPayment).toLocaleString()} <span className="text-sm font-normal">{t_calc.currency}</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default MortgageCalculator;
