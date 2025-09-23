<script setup lang="ts">
import FormTask from '../components/FormTask.vue'
import useCreateOrEdit from '../composables/useCreateOrEdit'

const props = defineProps<{
  id?: string
}>()
  
const {
  isRenderable,
  pending,
  task,
  
  submit
} = useCreateOrEdit(props)   
</script>

<template>
  <div class="container row col-md-6 mx-auto w-1/2">
    <h1 v-if="pending" class="text-2xl" align="center">Loading...</h1>
    <h1 v-else class="text-2xl" align="center">
      {{$props.id ? 'Editing' : 'Creating'}} Tast
    </h1>
    <FormTask v-if="isRenderable" :task="task" @submit='submit' />
  </div>
</template>