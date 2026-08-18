import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CategoryForm from '../../components/forms/CategoryForm'
import { createCategory } from '../../context/catalogSlice'

export default function CategoryCreate() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleCreate = (category) => {
    dispatch(createCategory(category))
    navigate('/categories')
  }

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Add category</h1>
          <p>Create a new group for your menu.</p>
        </div>
      </div>
      <CategoryForm
        initialValues={{ name: '', description: '', status: 'Active' }}
        onSubmit={handleCreate}
        submitLabel="Create category"
      />
    </>
  )
}
