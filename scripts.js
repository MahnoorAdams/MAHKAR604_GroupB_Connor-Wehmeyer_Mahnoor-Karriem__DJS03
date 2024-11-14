import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

// Section 1
// Function to render a list of book previews on the page
const renderBooks = (bookList) => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of bookList.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button'); // Create a button for each book
        element.classList = 'preview';
        element.setAttribute('data-preview', id);

        // Build the button's inner HTML with book details
        element.innerHTML = ` 
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

        fragment.appendChild(element);
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
    updateShowMoreButton(); // Update the button text after rendering
};
// Section 2
// Function to update the "Show More" button based on remaining books
const updateShowMoreButton = () => {
    const remaining = matches.length - (page * BOOKS_PER_PAGE); // Calculate remaining books
    const button = document.querySelector('[data-list-button]');
    button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
    `;
    button.disabled = remaining <= 0; // Disable button if no more books
};
// Section 3
// Function to populate select dropdowns for genres and authors
const populateSelectOptions = (selectElement, options, defaultText) => {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option'); // Default option
    firstOption.value = 'any';
    firstOption.innerText = defaultText;
    fragment.appendChild(firstOption);

    // Loop through options and create option elements
    for (const [id, name] of Object.entries(options)) {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    }
    selectElement.appendChild(fragment);
};

// Section 4
// Function to set the theme (light/dark mode)
const setTheme = (theme) => {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
};
// Section 5
// Function to handle search
const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    // Filter books based on genre, title, and author
    matches = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return titleMatch && authorMatch && genreMatch;
    });

    page = 1;
    document.querySelector('[data-list-items]').innerHTML = ''; // Clear current book list
    renderBooks(matches);
    document.querySelector('[data-search-overlay]').open = false; // Close overlay
};
// Section 6
// Function to load more books when the button is clicked
const loadMoreBooks = () => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', id); // Set the book ID for preview

         // Build button HTML for each book
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

        fragment.appendChild(element);
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1; 
    updateShowMoreButton(); // Update the button text after loading more
};
// Section 7
// Function to handle displaying book details on preview click
const handleBookPreview = (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    // Loop through the path to find the clicked book's data
    for (const node of pathArray) {
        if (node?.dataset?.preview) { 
            active = books.find(book => book.id === node.dataset.preview); // Find the corresponding book
            break; // Exit loop if found
        }
    }

    if (active) {
        // Populate the detailed view with the active book's data
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
};
// Section 9
// Initial render
renderBooks(matches); // Render the initial list of books
populateSelectOptions(document.querySelector('[data-search-genres]'), genres, 'All Genres'); // Genre options
populateSelectOptions(document.querySelector('[data-search-authors]'), authors, 'All Authors'); // Author options 

// Theme setup
// Set up initial theme based on user preference
const preferredTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
setTheme(preferredTheme); // Apply the preferred theme
document.querySelector('[data-settings-theme]').value = preferredTheme;

// Event listeners
// Load more books on button click
document.querySelector('[data-list-button]').addEventListener('click', loadMoreBooks);

// Show book preview on item click
document.querySelector('[data-list-items]').addEventListener('click', handleBookPreview);

// Handle search form submission
document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);



// Closing overlays
// Close search overlay
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false; 
});

// Close settings overlay
document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});
// Open search overlay
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus(); // Focus on search input
});
// Open settings overlay
document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

 // Close the active book detail overlay
document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.target); 
    const { theme } = Object.fromEntries(formData); // Get selected theme
    setTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;  // Close settings overlay
});