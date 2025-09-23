import { ref } from 'vue'
import type { Task } from '@/types'

type Props = {
  readonly task?: Record<string, any>;
  readonly onSubmit?: ((...args: any[]) => any);
}
type Ctx = {
  emit: (event: "submit", ...args: any[]) => void;
}

export default (props: Props, ctx: Ctx) => {
  const form = ref(props.task as Task)
  const submit = () => ctx.emit('submit', form.value )

  return {
    form,

    submit
  }
}
