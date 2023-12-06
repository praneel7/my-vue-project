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
            <p v-if="isAnimeGenerated" class="info">{{ "Title: " + animeData.title }}</p>
            <p v-if="isAnimeGenerated" class="info">{{ "Description: " + animeData.synopsis }}</p>
            <p v-if="isAnimeGenerated" class="info">{{ "Number of Episodes: " +animeData.episodes }}</p>
            <p v-if="isAnimeGenerated" class="info">Learn more <a :href="animeData.url" target="_blank">here!</a></p>
          </div>

          <div id="button-container">
            <button class="anime-buttons" @click="generateRandomAnime">Generate New Anime!</button>
            <button class="anime-buttons" @click="addToWatchList" v-if="animeData.title">Add To List</button>
          </div>
        </section>

        <div id="anime-list" v-if="isLoggedIn">
          <h1>Your List</h1>
          <ul id="animeListUl">
            <li class="anime" v-for="(anime, index) in watchList" :key="index">
              <input type="checkbox" class="check">
              <p class="title">{{ "Title: " + anime.title }}</p>
              <p class="episodes">{{ "Episodes: " + anime.episodes }}</p>
              <button class="delete" @click="removeFromWatchList(index)">Delete</button>
            </li>
          </ul>

          <div id="stats">
            <p class="info">Average show length on list: {{ averageLength }}</p>
          </div>

          <h1>Plot of Episodes</h1>
          <canvas id="myChart" ref="myChartRef"></canvas>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import axios from 'axios';

export default {
  name: 'AnimeWatchList',
  data() {
    return {
      apiUrl: "https://api.jikan.moe/v4/random/anime",
      animeData: {
        imageUrl: "https://imageio.forbes.com/specials-images/imageserve/5ed68e8310716f0007411996/A-black-screen--like-the-one-that-overtook-the-internet-on-the-morning-of-June-2-/960x0.jpg?height=399&width=711&fit=bounds",
        title: "",
        synopsis: "",
        episodes: "",
        url: ""
      },
      watchList: [],
      isLoggedIn: false,
      isLoginPageVisible: false,
      isAnimeGenerated: false,
      username: '',
      password: '',
      newUsername: '',
      newPassword: '',
      chart: null
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
    if (error.response && error.response.status === 400) {
      alert('Incorrect username or password. Please try again.'); // Displaying a simple alert
    } else {
      alert('An error occurred during login. Please try again later.'); // For other types of errors
    }
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
      //this.login();
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
      // session data cleared through server
      // Reset the login and register form fields
    this.username = '';
    this.password = '';
    this.newUsername = '';
    this.newPassword = '';
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
            this.isAnimeGenerated = true;
          })
          .catch(error => {
            console.error(error);
          });
    },
    addToWatchList() {
      this.watchList.push({ ...this.animeData });
      this.updatePlot();
    },
    removeFromWatchList(index) {
      this.watchList.splice(index, 1);
      this.updatePlot();
    },
    updatePlot() {
      const titles = this.watchList.map(anime => anime.title);
      const epnums = this.watchList.map(anime => anime.episodes);

      if(this.chart){
        this.chart.destroy();
      }
      var barColors = "orange";

      
      this.chart = new Chart(this.$refs.myChartRef, {
      type: "bar",
      data: {
        labels: titles,
        datasets: [{
          backgroundColor: barColors,
          data: epnums
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Number of Episodes per Show on List"
          },
          legend: { display: false }
        },
        
        scales: {
          y: {
            beginAtZero: true
          }
        },
      }
    });
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
