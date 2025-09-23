import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as Services from '../services/'
import type { Task } from '@/types'
import { useEncryption } from './encryption';


export default (props: { readonly id?: string; }) => {
  const { decrypt, encrypt } = useEncryption();
  const router = useRouter()
  const task = ref({} as Task)
  const pending = ref(false)

  const isRenderable = computed(
    ()=> (props.id && Object.keys(task.value).length > 0)
      || props.id===undefined
  )
    
  const getTask = ()=> {
    pending.value = true
    Services.getTask(props.id)
      .then(async response => {
         const encData = await decrypt(response.data.encData);
         return task.value = JSON.parse((encData as any).data);
      })
      .catch(
        error => console.log({
          errorCode: error.code, errorMessage: error.message
        })
      )
      .finally(() => pending.value = false)
  }

  const submit = async (task: Task) => {
    pending.value = true
    const payload = { encData: await encrypt('data=' + JSON.stringify(task)) };

    if (props.id===undefined) {
      Services.insertTask(payload)
        .then(response => {
          alert(response.data.message)
          router.push({name: 'index'})
        })
        .catch(error => console.log(error))
        .finally(() => pending.value = false)
    } else {      
      Services.updateTask(props.id, payload)
        .then(async response => {
          const encData = await decrypt(response.data.encData);
          alert(JSON.parse((encData as any).data).message);
          router.push({name: 'index'})
        })
        .catch(error => console.log(error))
        .finally(() => pending.value = false)
    }
  }

  onMounted(()=>{
    if (props.id)
      getTask();
  })
    
  return {
    isRenderable,
    pending,
    task,
    
    submit
  }
}
