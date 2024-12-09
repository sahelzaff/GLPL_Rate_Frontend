const SearchSection = ({ 
    newPol, 
    setNewPol, 
    newPod, 
    setNewPod, 
    handleNewSearch, 
    searchError,
    pol,
    pod 
}) => {
    const handlePolChange = (value) => {
        setNewPol(value?.code || '');
    };

    const handlePodChange = (value) => {
        setNewPod(value?.code || '');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port of Loading (POL)
                    </label>
                    <Autocomplete
                        type="pol"
                        value={pol || ''}
                        onChange={handlePolChange}
                        placeholder="Enter POL"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port of Discharge (POD)
                    </label>
                    <Autocomplete
                        type="pod"
                        value={pod || ''}
                        onChange={handlePodChange}
                        placeholder="Enter POD"
                    />
                </div>
                <button
                    onClick={handleNewSearch}
                    className="bg-[#C6082C] text-white px-6 py-2 rounded-md hover:bg-[#a00624] transition-colors"
                >
                    Search
                </button>
            </div>
            {searchError && (
                <p className="text-red-500 text-sm mt-2">{searchError}</p>
            )}
        </div>
    );
}; 