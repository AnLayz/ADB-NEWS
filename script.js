document.addEventListener('DOMContentLoaded', () => {
  const themeToggleButton = document.getElementById('theme-toggle');
  const articlesContainer = document.getElementById('articles-container');
  const categoryFilter = document.getElementById('category-filter');
  const sortSelect = document.getElementById('sort-articles');
  const mostPopularContent = document.getElementById('most-popular-content');
  const mostPopularTitle = document.getElementById('article-title');
  const openModalBtn = document.getElementById('openModalBtn');

  let articles = [];
  let currentCategory = 'All';

  // Fetch articles from the JSON file
  fetch('Articles.json')
    .then(response => response.json())
    .then(data => {
        articles = data;
        displayArticles(articles);
        displayMostPopularArticle(articles); // Initial load for most popular article
    });

  // Function to display articles
  function displayArticles(filteredArticles) {
      articlesContainer.innerHTML = '';
      filteredArticles.forEach(article => {
          const readingTime = calculateReadingTime(article.wordCount);
          const articleElement = document.createElement('div');
          articleElement.classList.add('col-md-4', 'mb-4'); // Bootstrap grid column for layout
          articleElement.innerHTML = `
              <div class="card" data-article-id="${article.id}">
                  <div class="card-body">
                      <h5 class="card-title">${article.title}</h5>
                      <p><strong>Date:</strong> ${article.date}</p>
                      <p><strong>Category:</strong> ${article.category}</p>
                      <p>${article.content}</p>
                      <p><strong>Views:</strong> ${article.views}</p>
                      <p>${readingTime} min to read</p>
                  </div>
              </div>
          `;
          articleElement.addEventListener('click', () => openArticleModal(article));
          articlesContainer.appendChild(articleElement);
      });
  }

  // Function to open the modal with detailed information and image
  function openArticleModal(article) {
    // Increase the view count
    article.views += 1; // Increment view count
    displayMostPopularArticle(articles); // Recalculate the most popular article
    
    const modalTitle = document.querySelector('.modal-title');
    const modalDate = document.getElementById('modal-article-date');
    const modalCategory = document.getElementById('modal-article-category');
    const modalContent = document.getElementById('modal-article-content');
    const modalViews = document.getElementById('modal-article-views');
    const modalReadingTime = document.getElementById('modal-article-reading-time');
    const modalAuthor = document.getElementById('modal-article-author');
    const modalExtraInfo = document.getElementById('modal-article-extra-info');
    const modalImage = document.getElementById('modal-article-image'); // Image element

    // Populate the modal with detailed information
    modalTitle.textContent = article.title;
    modalDate.textContent = `Date: ${article.date}`;
    modalCategory.textContent = `Category: ${article.category}`;
    modalContent.textContent = article.content; // Detailed content
    modalViews.textContent = `Views: ${article.views}`;
    modalReadingTime.textContent = `Reading Time: ${calculateReadingTime(article.wordCount)} min`;
    modalAuthor.textContent = `Author: ${article.author}`; // Added author
    modalExtraInfo.textContent = `Additional Information: ${article.extraInfo || 'No additional information'}`; // Additional information

    // Set the image source
    modalImage.src = article.imageURL || ''; // If no imageURL, it will remain empty

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
  }

  // Calculate reading time based on word count
  function calculateReadingTime(wordCount) {
      const wordsPerMinute = 200;
      return Math.ceil(wordCount / wordsPerMinute);
  }

  // Filter by category
  function filterByCategory(category) {
      currentCategory = category;
      const filteredArticles = category === 'All' ? articles : articles.filter(article => article.category === category);
      displayArticles(filteredArticles);
      displayMostPopularArticle(filteredArticles); // Update most popular article within category
  }

  // Sort articles by selected criterion
  function sortArticles() {
      const filteredArticles = currentCategory === 'All' ? [...articles] : articles.filter(article => article.category === currentCategory);
      const sortBy = sortSelect.value;

      if (sortBy === 'views') {
          filteredArticles.sort((a, b) => b.views - a.views);
      } else if (sortBy === 'date') {
          filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      displayArticles(filteredArticles);
      displayMostPopularArticle(filteredArticles); // Update most popular article within sorted articles
  }

  // Function to display the current most popular article based on views
  function displayMostPopularArticle(articlesArray) {
      if (articlesArray.length === 0) {
          mostPopularContent.innerHTML = '<p>No articles available</p>';
          return;
      }
      const mostPopularArticle = articlesArray.reduce((prev, current) => (prev.views > current.views) ? prev : current);
      mostPopularContent.innerHTML = `
          <h4>${mostPopularArticle.title}</h4>
          <p><strong>Date:</strong> ${mostPopularArticle.date}</p>
          <p>${mostPopularArticle.content}</p>
          <p><strong>Views:</strong> ${mostPopularArticle.views}</p>
      `;

      // Set the current most popular article in the section
      mostPopularTitle.textContent = mostPopularArticle.title;
      openModalBtn.addEventListener('click', () => openArticleModal(mostPopularArticle));
  }

  // Event listener for category filter
  categoryFilter.addEventListener('click', (event) => {
      const selectedCategory = event.target.getAttribute('data-category');
      if (selectedCategory) {
          filterByCategory(selectedCategory);
          sortSelect.value = ''; // Reset sorting option
      }
  });

  // Event listener for sorting
  sortSelect.addEventListener('change', sortArticles);

  // Theme toggle
  themeToggleButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });

  // Apply saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
  }
});
