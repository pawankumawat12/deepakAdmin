import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '../../schema/product.schema'

export default function ProductForm({ categories, initialValues, onSubmit, submitLabel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(productSchema), defaultValues: initialValues })
  return <form className="entity-form card" onSubmit={handleSubmit(onSubmit)}>
    <div className="form-grid"><label>Product name<input {...register('name')} placeholder="e.g. Tandoori Paneer" /></label><label>Category<select {...register('categoryId')}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Price (₹)<input type="number" min="1" {...register('price')} /></label><label>Available stock<input type="number" min="0" {...register('stock')} /></label><label>Status<select {...register('status')}><option>Active</option><option>Out of stock</option></select></label></div>
    {Object.values(errors).map((error) => <small className="error" key={error.message}>{error.message}</small>)}
    <button className="primary-btn" type="submit">{submitLabel}</button>
  </form>
}
