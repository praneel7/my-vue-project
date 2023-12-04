<template>
  <div>
    <div class="login_logout">
      <button class="anime-buttons" @click="toggleLoginPage">Login</button>
      <button class="anime-buttons" v-if="isLoggedIn" @click="logout">Logout</button>
    </div>
    <div id="app">
      <header>
        <h1>Anime Watch List</h1>
      </header>

      <main>
        <div v-if="isLoginPageVisible" class="login_page">
          <div class="exit_container">
            <button class="exit_popup" @click="toggleLoginPage">X</button>
          </div>

          <h1 class="login">Login</h1>
          <div class="login">
            <input type="text" v-model="username" placeholder="Username" />
            <input type="password" v-model="password" placeholder="Password" />
            <button @click="login">Log In</button>
          </div>

          <h1 class="register">Register</h1>
          <div class="register">
            <input type="text" v-model="newUsername" placeholder="Username" />
            <input type="password" v-model="newPassword" placeholder="Password" />
            <button @click="register">Register</button>
          </div>
        </div>

        <section id="new-anime" v-if="isLoggedIn">
          <div id="img-container">
            <img :src="animeData.imageUrl" alt="Anime image">
          </div>

          <div id="anime-info">
            <p class="info">{{ animeData.title }}</p>
            <p class="info">{{ animeData.synopsis }}</p>
            <p class="info">{{ animeData.episodes }}</p>
            <p class="info"><a :href="animeData.url" target="_blank">{{ animeData.url }}</a></p>
          </div>

          <div id="button-container">
            <button class="anime-buttons" @click="generateRandomAnime">Generate New Anime!</button>
            <button class="anime-buttons" @click="addToWatchList" v-if="animeData.title">Add To List</button>
          </div>
        </section>

        <div id="anime-list" v-if="isLoggedIn">
          <h1>Your List</h1>
          <ul id="animeListUl">
            <li v-for="(anime, index) in watchList" :key="index">
              <input type="checkbox">
              <p class="title">{{ anime.title }}</p>
              <p class="episodes">{{ anime.episodes }}</p>
              <button class="delete" @click="removeFromWatchList(index)">Delete</button>
            </li>
          </ul>

          <div id="stats">
            <p class="info">Average show length on list: {{ averageLength }}</p>
          </div>

          <h1>Plot of Episodes</h1>
          <canvas id="myChart"></canvas>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
// import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'AnimeWatchList',
  data() {
    return {
      apiUrl: "https://api.jikan.moe/v4/random/anime",
      animeData: {
        imageUrl: "",
        title: "",
        synopsis: "",
        episodes: "",
        url: ""
      },
      watchList: [],
      isLoggedIn: false,
      isLoginPageVisible: false,
      username: '',
      password: '',
      newUsername: '',
      newPassword: '',
    };
  },
  computed: {
    averageLength() {
      if (this.watchList.length === 0) return 0;
      const total = this.watchList.reduce((acc, anime) => acc + anime.episodes, 0);
      return (total / this.watchList.length).toFixed(2);
    }
  },
  methods: {
    toggleLoginPage() {
      this.isLoginPageVisible = !this.isLoginPageVisible;
    },
    async login() {
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username: this.username,
        password: this.password
      });
      this.isLoggedIn = true;
      this.isLoginPageVisible = false;
      console.log('Login successful:', response.data);
      // You may want to handle the session token or user data here
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error, display message to the user
    }
  },
  async register() {
    try {
      const response = await axios.post('http://localhost:3000/register', {
        username: this.newUsername,
        password: this.newPassword
      });
      console.log('Registration successful:', response.data);
      this.newUsername = '';
      this.newPassword = '';
      // Optionally, you can log in the user immediately after registration
      this.username = this.newUsername;
      this.password = this.newPassword;
      this.login();
    } catch (error) {
      console.error('Registration error:', error);
      // Handle registration error, display message to the user
    }
  },
  async logout() {
    try {
      const response = await axios.post('http://localhost:3000/logout');
      this.isLoggedIn = false;
      console.log('Logout successful:', response.data);
      // You may want to clear the session data or token here
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
    generateRandomAnime() {
      axios.get(this.apiUrl)
          .then(response => {
            const anime = response.data.data;
            this.animeData = {
              imageUrl: anime.images.jpg.large_image_url,
              title: anime.title,
              synopsis: anime.synopsis,
              episodes: anime.episodes,
              url: anime.url
            };
          })
          .catch(error => {
            console.error(error);
          });
    },
    addToWatchList() {
      this.watchList.push({ ...this.animeData });
    },
    removeFromWatchList(index) {
      this.watchList.splice(index, 1);
    },
  },
  mounted() {
    // Additional mounted logic can go here
  }
};
</script>

<style scoped>
@import './style.css';

/* Additional styles if needed */
</style>
