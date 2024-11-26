<template>
  <div id="app">
    <header>
      <h2>Financial Data Visualization</h2>
    </header>
    <main>
      <!-- Integrate the Chart component -->
      <Chart />
    </main>
  </div>
</template>

<script>
// Import the Chart component
import Chart from './components/Chart.vue';

export default {
  name: 'App',
  components: {
    Chart,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

header {
  background-color: #42b983;
  padding: 20px;
  color: white;
}

main {
  padding: 20px;
}
</style>
