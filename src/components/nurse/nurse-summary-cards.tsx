import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/nurse/nurseUtils';
import {
  Users,
  AlertTriangle,
  Clock,
  AlertCircle,
  BedDouble,
} from 'lucide-react';

interface SummaryCardsProps {
  totalPatients: number;
  criticalPatients: number;
  avgWaitTime: number;
  distressedPatients: number;
  beddedPatients?: number;
}

export function SummaryCards({
  totalPatients,
  criticalPatients,
  avgWaitTime,
  distressedPatients,
  beddedPatients = 0,
}: SummaryCardsProps) {
  return (
    <div className='p-3 sm:p-6 sm:pt-2 pt-2 pb-2 sm:pb-2'>
      <div className='grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-5 gap-2 sm:gap-4'>
        
        {/* Total Patients Card */}
        <Card className='h-[80px] sm:h-[80px] sm:col-span-2 lg:col-span-1'>
          <CardContent className='p-2 sm:p-4 h-full'>
            <div className='flex flex-row items-center justify-between h-full'>
              <div className='flex items-center space-x-2'>
                <Users className='w-6 h-6 text-emerald-600 flex-shrink-0' />
                <p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
                  Total Patients
                </p>
              </div>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {totalPatients}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bedded Patients Card */}
        <Card className='h-[80px] sm:h-[80px] sm:col-span-2 lg:col-span-1'>
          <CardContent className='p-2 sm:p-4 h-full'>
            <div className='flex flex-row items-center justify-between h-full'>
              <div className='flex items-center space-x-2'>
                <BedDouble className='w-6 h-6 text-cyan-600 flex-shrink-0' />
                <p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
                  Beds Occupied
                </p>
              </div>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {beddedPatients}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Wait Time Card */}
        <Card className='h-[80px] sm:h-[80px] sm:col-span-2 lg:col-span-1'>
          <CardContent className='p-2 sm:p-4 h-full'>
            <div className='flex flex-row items-center justify-between h-full'>
              <div className='flex items-center space-x-2'>
                <Clock className='w-6 h-6 text-teal-600 flex-shrink-0' />
                <p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
                  Avg Wait
                </p>
              </div>
              <p className='text-lg font-bold mt-1 truncate'>
                {formatTime(avgWaitTime)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Patients Card */}
        <Card className='h-[80px] sm:h-[80px] sm:col-span-3 lg:col-span-1'>
          <CardContent className='p-2 sm:p-4 h-full'>
            <div className='flex flex-row items-center justify-between h-full'>
              <div className='flex items-center space-x-2'>


                <AlertTriangle className='w-6 h-6 text-red-500 flex-shrink-0' />
                <p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
                  Critical
                </p>
              </div>
              <p className='text-lg font-bold text-red-500 mt-1'>
                {criticalPatients}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distressed Patients Card */}
        <Card className='h-[80px] sm:h-[80px] col-span-2 sm:col-span-3 lg:col-span-1'>
          <CardContent className='p-2 sm:p-4 h-full'>
            <div className='flex flex-row items-center justify-between h-full'>
              <div className='flex items-center space-x-2'>
                <AlertCircle className='w-6 h-6 text-red-700 flex-shrink-0' />
                <p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
                  Distressed
                </p>
              </div>
              <p className='text-lg font-bold text-red-700 mt-1'>
                {distressedPatients}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
