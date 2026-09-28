import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'

const NotFound = () => (
  <div className="mx-auto max-w-content">
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="That page doesn't exist in the admin panel."
      action={
        <Link to="/orders" className="btn-primary btn-sm">
          Back to orders
        </Link>
      }
    />
  </div>
)

export default NotFound