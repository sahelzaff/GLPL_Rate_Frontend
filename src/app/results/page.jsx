'use client';
import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
    MagnifyingGlassIcon,
    ArrowLongRightIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    ClockIcon,
    CheckBadgeIcon,
    CheckIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import Navbar from '../components/Navbar';
import Autocomplete from '../components/Autocomplete';
import assets from '../../../public/assets/asset';
import RateFilters from '../components/RateFilters';
import { LuShip } from "react-icons/lu";

function ResultsContent() {
    const _router = useRouter();
    const { data: _session, _status } = useSession();
    const _searchParams = useSearchParams();
    const [_results, _setResults] = useState([]);
    const [_loading, _setLoading] = useState(true);
    const [_error, _setError] = useState(null);
    const [_newPol, _setNewPol] = useState('');
    const [_newPod, _setNewPod] = useState('');
    const [_searchError, _setSearchError] = useState('');
    const [_filteredResults, _setFilteredResults] = useState([]);
    const [_highlights, _setHighlights] = useState(null);
    const [_rateRefs, _setRateRefs] = useState({});

    // Rest of the component code...
}

export default function Results() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
} 