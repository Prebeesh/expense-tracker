/** @jsxRuntime classic */
/** @jsx React.createElement */

// Note: Babel is running in the browser, so we access React globally
const { useState, useEffect, useCallback } = React;
const { initializeApp, getAuth, signInWithCustomToken, signInAnonymously, getFirestore, onAuthStateChanged, collection, query, onSnapshot, serverTimestamp } = window.FirebaseServices;

// Define the main component
const App = () => {
    // State for Firebase services and user information
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get global configuration
    const { firebaseConfig, appId, initialAuthToken } = window.GlobalConfig || {};

    // 1. Initialize Firebase and Authenticate User
    useEffect(() => {
        if (!firebaseConfig) {
            setError("Firebase configuration is missing. Please check firebaseConfig.js.");
            setLoading(false);
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);
            
            setDb(firestore);
            setAuth(firebaseAuth);

            // Set up Auth State Listener
            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (!user) {
                    console.log("No user signed in. Attempting anonymous sign-in.");
                    if (initialAuthToken) {
                        // Use custom token if available (provided by the canvas environment)
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    } else {
                        // Fallback to anonymous sign-in
                        await signInAnonymously(firebaseAuth);
                    }
                }
                // Once authentication is attempted/complete, set the readiness state
                setUserId(firebaseAuth.currentUser?.uid || 'anonymous');
                setIsAuthReady(true);
                setLoading(false);
                console.log(`[Auth]: User ID set: ${firebaseAuth.currentUser?.uid || 'anonymous'}`);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Error during Firebase initialization or sign-in:", e);
            setError("Failed to initialize Firebase services.");
            setLoading(false);
        }
    }, [firebaseConfig, initialAuthToken]);

    // 2. Fetch Data (using onSnapshot for real-time updates)
    useEffect(() => {
        // Only run if authentication is ready and we have a database instance
        if (!isAuthReady || !db || !userId) return;

        // Define the Firestore path for public data (accessible by all users of this app)
        const publicCollectionPath = `/artifacts/${appId}/public/data/expenses`;
        const q = query(collection(db, publicCollectionPath));

        console.log(`[Firestore]: Attaching real-time listener to ${publicCollectionPath}`);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expenseData = [];
            snapshot.forEach((doc) => {
                expenseData.push({ id: doc.id, ...doc.data() });
            });
            setData(expenseData);
            console.log(`[Firestore]: Fetched ${expenseData.length} expense records.`);
        }, (err) => {
            console.error("Firestore snapshot error:", err);
            setError("Failed to fetch real-time data.");
        });

        // Cleanup listener on unmount or dependency change
        return () => unsubscribe();
    }, [isAuthReady, db, userId, appId]);

    // --- UI Rendering ---

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-xl animate-spin border-4 border-t-4 border-gray-600 border-t-purple-500 h-8 w-8 rounded-full"></div>
                <span className="ml-4">Loading Application...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-900 text-white p-4">
                <div className="bg-red-700 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">Application Error</h2>
                    <p className="font-mono">{error}</p>
                    <p className="mt-2 text-sm">Check your console for details and ensure <code>firebaseConfig.js</code> is correctly set up.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <header className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Global Money Manager
                </h1>
                <div className="text-sm bg-gray-700 p-2 rounded-lg font-mono text-purple-300">
                    User: {userId}
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Placeholder Card 1 */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-purple-700">
                    <h2 className="text-xl font-semibold mb-3 text-purple-400">Total Shared Expenses</h2>
                    <p className="text-4xl font-bold">${data.length * 100}.00</p>
                    <p className="text-sm text-gray-400 mt-2">Based on {data.length} records.</p>
                </div>

                {/* Placeholder Card 2 */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-pink-700">
                    <h2 className="text-xl font-semibold mb-3 text-pink-400">Your Current Liability</h2>
                    <p className="text-4xl font-bold">${data.length * 50}.00</p>
                    <p className="text-sm text-gray-400 mt-2">50% of shared total.</p>
                </div>

                {/* Data List */}
                <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-2xl border border-blue-700">
                    <h2 className="text-2xl font-bold mb-4 text-blue-400">Expense History ({data.length})</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {data.length === 0 ? (
                            <p className="text-gray-500">No expenses recorded yet. Data path: <code>/artifacts/{appId}/public/data/expenses</code></p>
                        ) : (
                            data.map((item) => (
                                <div key={item.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center transition duration-300 hover:bg-gray-600">
                                    <div>
                                        <p className="text-lg font-medium">{item.id}</p>
                                        <p className="text-sm text-gray-400">Added on: {new Date(item.timestamp?.seconds * 1000).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-xl font-bold text-green-400">$100.00</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

// Mount the App component
const container = document.getElementById('root');
if (container) {
    ReactDOM.createRoot(container).render(<App />);
} else {
    console.error("Could not find root element to mount the application.");
}

// Simple data structure demonstration for the Firestore database.
// This is not actual code execution, just a comment showing how to manually add data for testing.
/*
const exampleData = {
    // collection: /artifacts/{appId}/public/data/expenses
    // document fields:
    amount: 100.00,
    currency: "CAD",
    category: "Shared Groceries",
    timestamp: serverTimestamp() // Use serverTimestamp for accuracy
};
*/