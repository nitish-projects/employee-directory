const API_URL = 'https://randomuser.me/api/?results=12';

export async function fetchEmployees() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error('Failed to fetch employees');
    }

    const data = await response.json();

    return data.results;
}