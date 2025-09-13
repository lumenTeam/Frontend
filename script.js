// Initialize Supabase
const SUPABASE_URL = "https://tmkaxvxokzymirwrvaxq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRta2F4dnhva3p5bWlyd3J2YXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTY4MDcsImV4cCI6MjA3MzI3MjgwN30.nY9dlGji6Xt97IjqjgpZNq6VBU2bZvq3JGi5vbaKBfk";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const plansTable = document.getElementById('plansTable').querySelector('tbody');
const planForm = document.getElementById('planForm');
const searchInput = document.getElementById('searchInput');
const backButton = document.getElementById('backButton');

let currentPlans = [];
let sortOrder = { price: 'asc', quota: 'asc' };

// Go back button
backButton.addEventListener('click', () => {
    window.history.back();
});

// Add plan
planForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quota = parseFloat(document.getElementById('quota').value);

    if (!name || isNaN(price) || isNaN(quota)) {
        alert('Please fill all fields properly.');
        return;
    }

    const { error } = await supabase
        .from('plans')
        .insert([{ name, price, quota, is_active: true }]);

    if (error) {
        alert('Error adding plan: ' + error.message);
    } else {
        alert('Plan added successfully!');
        fetchPlans();
        planForm.reset();
    }
});

// Fetch plans from Supabase
async function fetchPlans() {
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching plans:', error.message);
    } else {
        currentPlans = data;

        if (currentPlans.length === 0) {
            insertDummyPlans();
        } else {
            renderPlans();
        }
    }
}

// Insert dummy plans if table is empty
async function insertDummyPlans() {
    const dummyPlans = [
        { name: "Basic Plan", price: 499, quota: 50, is_active: true },
        { name: "Standard Plan", price: 999, quota: 100, is_active: true },
        { name: "Premium Plan", price: 1999, quota: 500, is_active: false }
    ];

    const { error } = await supabase
        .from('plans')
        .insert(dummyPlans);

    if (error) {
        console.error("Error inserting dummy plans:", error.message);
    } else {
        console.log("Dummy plans inserted.");
        fetchPlans();
    }
}

// Render the plans table
function renderPlans() {
    const filter = searchInput.value.toLowerCase();
    plansTable.innerHTML = "";

    const filtered = currentPlans.filter(plan => 
        plan.name.toLowerCase().includes(filter) ||
        plan.price.toString().includes(filter) ||
        plan.quota.toString().includes(filter)
    );

    filtered.forEach(plan => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${plan.name}</td>
            <td>₹${plan.price}</td>
            <td>${plan.quota} GB</td>
            <td>${plan.is_active ? 'Active' : 'Inactive'}</td>
            <td>${mockSubscribers(plan.id)}</td>
            <td>
                <button class="btn-edit" onclick="editPlan(${plan.id})">Edit</button>
                <button class="btn-delete" onclick="deletePlan(${plan.id})">Delete</button>
                <button class="btn-toggle" onclick="togglePlan(${plan.id}, ${plan.is_active})">
                    ${plan.is_active ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        `;
        plansTable.appendChild(row);
    });
}

// Sort plans
function sortPlans(field) {
    currentPlans.sort((a, b) => {
        if (sortOrder[field] === 'asc') {
            sortOrder[field] = 'desc';
            return a[field] - b[field];
        } else {
            sortOrder[field] = 'asc';
            return b[field] - a[field];
        }
    });
    renderPlans();
}

// Edit plan
async function editPlan(id) {
    const plan = currentPlans.find(p => p.id === id);
    if (!plan) return;

    const newName = prompt('Enter new name:', plan.name);
    const newPrice = prompt('Enter new price:', plan.price);
    const newQuota = prompt('Enter new quota:', plan.quota);

    if (newName && !isNaN(parseFloat(newPrice)) && !isNaN(parseFloat(newQuota))) {
        const { error } = await supabase
            .from('plans')
            .update({
                name: newName.trim(),
                price: parseFloat(newPrice),
                quota: parseFloat(newQuota)
            })
            .eq('id', id);

        if (error) {
            alert('Error updating plan: ' + error.message);
        } else {
            alert('Plan updated!');
            fetchPlans();
        }
    } else {
        alert('Invalid input.');
    }
}

// Delete plan
async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting plan: ' + error.message);
    } else {
        alert('Plan deleted!');
        fetchPlans();
    }
}

// Toggle active/inactive
async function togglePlan(id, isActive) {
    const { error } = await supabase
        .from('plans')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (error) {
        alert('Error toggling status: ' + error.message);
    } else {
        alert('Status updated!');
        fetchPlans();
    }
}

// Mock analytics
function mockSubscribers(planId) {
    return Math.floor(Math.random() * 1000);
}

// Search functionality
searchInput.addEventListener('input', renderPlans);

// Initial data load
fetchPlans();
