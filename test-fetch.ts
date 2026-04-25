async function testFetch() {
    try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data received:', data);
    } catch (error: unknown) {
        // Solución TS2339: Type Guard seguro para acceder a 'code'
        if (error instanceof Error) {
            const errorWithCode = error as Error & { code?: string | number };
            if (errorWithCode.code) {
                console.error(`Error code: ${errorWithCode.code}`);
            }
            console.error(`Error message: ${error.message}`);
        } else if (typeof error === 'object' && error !== null && 'code' in error) {
            const errObj = error as { code: unknown };
            console.error(`Error code: ${errObj.code}`);
        } else {
            console.error('An unknown error occurred:', error);
        }
    }
}
testFetch();
