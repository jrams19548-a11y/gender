document.addEventListener('DOMContentLoaded', async function() {
    const signupForm = document.getElementById('signupForm');
    const genderSelect = document.getElementById('gender');
    const customGenderDiv = document.getElementById('customGender');
    const customGenderInput = document.getElementById('customGenderInput');
    const messageDiv = document.getElementById('message');
    const searchInput = document.getElementById('search');
    const userListDiv = document.getElementById('userList');

    let users = [];
    let genders = [];

    const wittyLines = [
        "That gender's already taken! Try being more original!",
        "Gender duplicate detected. Creativity overload!",
        "Oops, that gender exists. Be unique!",
        "Gender already in use. Think outside the box!",
        "Duplicate gender alert! Innovation required!"
    ];

    async function loadData() {
        try {
            const usersResponse = await fetch('/users');
            users = await usersResponse.json();
            const gendersResponse = await fetch('/genders');
            genders = await gendersResponse.json();
            if (genders.length === 0) {
                genders = ['Male', 'Female', 'Non-binary'];
            }
            updateGenderOptions();
            displayUsers();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function updateGenderOptions() {
        // Clear existing options except the first
        while (genderSelect.options.length > 4) {
            genderSelect.remove(4);
        }
        // Add custom genders
        genders.slice(3).forEach(gender => {
            const option = document.createElement('option');
            option.value = gender;
            option.textContent = gender;
            genderSelect.appendChild(option);
        });
    }

    function displayUsers(filter = '') {
        userListDiv.innerHTML = '';
        users.filter(user => user.username.toLowerCase().includes(filter.toLowerCase())).forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user';
            userDiv.textContent = `Username: ${user.username}, Gender: ${user.gender}`;
            userListDiv.appendChild(userDiv);
        });
    }

    genderSelect.addEventListener('change', function() {
        if (this.value === 'Custom') {
            customGenderDiv.style.display = 'block';
            customGenderInput.required = true;
        } else {
            customGenderDiv.style.display = 'none';
            customGenderInput.required = false;
        }
    });

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        let gender = genderSelect.value;

        if (gender === 'Custom') {
            gender = customGenderInput.value.trim();
            if (gender === '') {
                messageDiv.textContent = 'Please enter a custom gender.';
                return;
            }
            // Check if gender exists
            if (genders.includes(gender)) {
                const randomLine = wittyLines[Math.floor(Math.random() * wittyLines.length)];
                messageDiv.textContent = randomLine;
                return;
            }
            // Add gender
            try {
                const response = await fetch('/genders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gender })
                });
                const result = await response.json();
                if (result.status === 'duplicate') {
                    const randomLine = wittyLines[Math.floor(Math.random() * wittyLines.length)];
                    messageDiv.textContent = randomLine;
                    return;
                }
                genders.push(gender);
                updateGenderOptions();
            } catch (error) {
                console.error('Error adding gender:', error);
                messageDiv.textContent = 'Error adding custom gender.';
                return;
            }
        }

        if (users.some(user => user.username === username)) {
            messageDiv.textContent = 'Username already exists.';
            return;
        }

        // Add user
        try {
            const response = await fetch('/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, gender })
            });
            await response.json();
            users.push({ username, password, gender });
            messageDiv.textContent = 'Signup successful!';
            signupForm.reset();
            customGenderDiv.style.display = 'none';
            displayUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            messageDiv.textContent = 'Error signing up.';
        }
    });

    searchInput.addEventListener('input', function() {
        displayUsers(this.value);
    });

    await loadData();
});