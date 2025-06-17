import {
  Activity,
  Search,
  Stethoscope,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export const NurseHeader = ({
  searchTerm,
  setSearchTerm,
  setTriageModalOpen,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setTriageModalOpen: (open: boolean) => void;
}) => {
  return (
    <header className='bg-white border-b border-gray-200 px-4 sm:px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* LOGO AND TITLE */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
              <Activity className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
                Ward Patient Monitor
              </h1>
              <p className='text-xs sm:text-sm text-gray-600 hidden sm:block'>
                Real-time patient status and sentiment tracking
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className='hidden lg:flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <Search className='w-5 h-5 text-gray-400' />
            <Input
              type='text'
              placeholder='Search patients...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-64'
            />
          </div>
          <Button
            className='bg-blue-600 hover:bg-blue-700 text-white'
            onClick={() => setTriageModalOpen(true)}
          >
            <Stethoscope className='w-4 h-4 mr-2' />
            Triage Patient
          </Button>
        </div>

        {/* Mobile/Tablet Actions */}
        <div className='flex lg:hidden items-center space-x-2'>
          {/* Search - Hidden on mobile, shown on tablet */}
          <div className='hidden md:flex items-center space-x-2'>
            <Search className='w-5 h-5 text-gray-400' />
            <Input
              type='text'
              placeholder='Search...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-32'
            />
          </div>

          {/* Essential buttons only */}
          <Button
            className='bg-blue-600 hover:bg-blue-700 text-white'
            onClick={() => setTriageModalOpen(true)}
            size='sm'
          >
            <Stethoscope className='w-4 h-4 md:mr-2' />
            <span className='hidden md:inline'>Triage</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar - Below header on small screens */}
      <div className='mt-4 md:hidden'>
        <div className='flex items-center space-x-2'>
          <div className='flex items-center space-x-2 flex-1'>
            <Search className='w-5 h-5 text-gray-400' />
            <Input
              type='text'
              placeholder='Search patients...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='flex-1'
            />
          </div>
        </div>
      </div>
    </header>
  );
};
