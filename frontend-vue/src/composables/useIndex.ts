import { ref, onMounted } from 'vue'
import * as Services from '../services/'
import type { Ref } from 'vue'
import type { Task } from '@/types'
import { useEncryption } from './encryption';

const { decrypt } = useEncryption();

export default () => {
  const tasks: Ref<Task[]> = ref([])
  const pending = ref(false)
  const { decrypt, } = useEncryption();

  const getTasks = () => {
    
    pending.value = true
    Services.getTasks()
      .then(
        async response => {
          //let encData;
          

/*if(outcome.encData != null) {
            encData = await decrypt(outcome.encData);
            // console.log('encData', encData)
        } else {
            encData = outcome.msg;
        }
        result.value = {
            status: outcome.status,
            encData: encData
        };*/
                  console.log(response)

          const encData = await decrypt(response.data.encData)
          // console.log(JSON.parse((encData as any).data))
          return tasks.value = JSON.parse((encData as any).data)

          //return tasks.value = response.data
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
