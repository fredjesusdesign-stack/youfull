import { createInstructor } from '../actions'
import InstructorForm from '@/components/admin/InstructorForm'

export default function NovoInstrutorPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-text mb-6">New instructor</h1>
      <InstructorForm action={createInstructor} />
    </div>
  )
}
