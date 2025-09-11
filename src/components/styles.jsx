const selectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'rgba(30, 41, 59, 0.8)', // slate-800/80
        borderColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        minHeight: '50px',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
        '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)'
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(12px)'
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? 'rgba(59, 130, 246, 0.8)'
            : state.isFocused
                ? 'rgba(255, 255, 255, 0.1)'
                : 'transparent',
        color: 'white',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999, // 👈 makes sure it’s above everything
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'white'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    input: (provided) => ({
        ...provided,
        color: 'white'
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: 'rgba(255, 255, 255, 0.6)',
        '&:hover': {
            color: 'white'
        }
    })
};

export default selectStyles