// controllers/articleController.js

const path = require("path");
const fs = require("fs-extra");

// Function to handle uploading a new article
const addArticle = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const headingImage = req.file;

    if (!title || !content || !author || !headingImage) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a unique article ID (preferably using a UUID for uniqueness)
    const { v4: uuidv4 } = require("uuid");
    const articleId = uuidv4();
    const articlesDir = path.join(__dirname, "../assets/articles");
    const articlePath = path.join(articlesDir, articleId);

    await fs.ensureDir(articlePath);

    // Save heading image
    const imagePath = path.join(articlePath, headingImage.originalname);
    await fs.move(headingImage.path, imagePath);

    // Save content and author
    await fs.writeFile(path.join(articlePath, "content.md"), content);
    await fs.writeFile(path.join(articlePath, "author.txt"), author);

    res
      .status(201)
      .json({ message: "Article uploaded successfully.", articleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while uploading article." });
  }
};

// Function to fetch all user articles and external news, with user articles on top
const getArticles = async (req, res) => {
  try {
    const articlesDir = path.join(__dirname, "../assets/articles");
    let userArticles = [];

    if (await fs.pathExists(articlesDir)) {
      const articleFolders = await fs.readdir(articlesDir);

      userArticles = await Promise.all(
        articleFolders.map(async (folder) => {
          const articlePath = path.join(articlesDir, folder);
          const files = await fs.readdir(articlePath);

          const article = {
            id: folder,
            title: "",
            headingImage: "",
            content: "",
            author: "",
            isUserArticle: true, // Flag to identify user articles
          };

          for (const file of files) {
            if (file.toLowerCase().startsWith("headingimage")) {
              article.headingImage = `/assets/articles/${folder}/${file}`;
            } else if (file === "content.md") {
              article.content = await fs.readFile(
                path.join(articlePath, file),
                "utf-8"
              );
            } else if (file === "author.txt") {
              article.author = await fs.readFile(
                path.join(articlePath, file),
                "utf-8"
              );
            }
          }

          return article;
        })
      );
    }

    // Placeholder for fetching external news articles
    // Assuming you have a service or another controller to fetch news
    // For demonstration, we'll leave this empty
    const externalNews = []; // Replace with actual data fetching if required

    // Combine user articles and external news, with user articles first
    const combinedArticles = [...userArticles, ...externalNews];

    res.json(combinedArticles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching articles." });
  }
};

// Function to fetch a single article by ID (only for user articles)
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const articlePath = path.join(__dirname, "../assets/articles", id);

    if (!(await fs.pathExists(articlePath))) {
      return res.status(404).json({ message: "Article not found." });
    }

    const files = await fs.readdir(articlePath);

    const article = {
      id,
      title: "",
      headingImage: "",
      content: "",
      author: "",
      isUserArticle: true,
    };

    for (const file of files) {
      if (file.toLowerCase().startsWith("headingimage")) {
        article.headingImage = `/assets/articles/${id}/${file}`;
      } else if (file === "content.md") {
        article.content = await fs.readFile(
          path.join(articlePath, file),
          "utf-8"
        );
      } else if (file === "author.txt") {
        article.author = await fs.readFile(
          path.join(articlePath, file),
          "utf-8"
        );
      }
    }

    res.json(article);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching the article." });
  }
};

// ... existing handleControllerError if needed

module.exports = {
  getArticles,
  addArticle,
  getArticleById,
};
