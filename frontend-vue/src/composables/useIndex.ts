import { ref, onMounted } from 'vue'
import * as Services from '../services/'
import type { Ref } from 'vue'
import type { Task } from '@/types'
import { useEncryption } from './encryption';

export default () => {
  const tasks: Ref<Task[]> = ref([])
  const pending = ref(false)
  const { decrypt, } = useEncryption();

  const getTasks = () => {
    
    pending.value = true
    Services.getTasks()
      .then(
        async response => {
          const encData = await decrypt(response.data.encData);
          return tasks.value = JSON.parse((encData as any).data);
        }
      )
      .catch(
        error => console.log({
          errorCode: error.code, errorMessage: error.message
        })
      )
      .finally(() => pending.value = false)
  }

  const removeTask = (id: string) => {
    if (confirm("Do you want to delete this task?")) {
      pending.value = true
      Services.removeTask(id)
        .then(response => {
          console.log({ statusCode: response.status })
          if (response.status===204)
            getTasks();
          })
        .catch(
          error => console.log({
            errorCode: error.code, errorMessage: error.message
          })
        )
        .finally(() => pending.value = false)
    }
  }

  onMounted(() => getTasks())

  return {
    pending,
    tasks,

    removeTask
  }
}
