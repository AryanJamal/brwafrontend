const formatDate= (dateString) => {

        if (!dateString) {
            return ''; // Return an empty string if no date is provided
        }

        const date = new Date(dateString);
        
        // A helper to pad single-digit numbers with a leading zero.
        const pad = (number) => {
            return number < 10 ? `0${number}` : number;
        };

        // Extract and format the date components.
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // getMonth is 0-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        // Construct the final string.
        return `${hours}:${minutes} - ${year} / ${month} / ${day}`;
    };

export default formatDate