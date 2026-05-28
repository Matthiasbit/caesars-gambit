import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameErrorDialog } from './GameErrorDialog'

const baseProps = {
    isOpen: true,
    message: 'Das geht gerade nicht.',
    onClose: vi.fn(),
}

describe('GameErrorDialog', () => {
    it('renders the dialog contents when open', () => {
        render(<GameErrorDialog {...baseProps} />)

        expect(screen.getByText(/spielaktion nicht möglich/i)).toBeInTheDocument()
        expect(screen.getByText(/das geht gerade nicht\./i)).toBeInTheDocument()
    })

    it('does not render when closed', () => {
        render(<GameErrorDialog {...baseProps} isOpen={false} />)

        expect(screen.queryByText(/spielaktion nicht möglich/i)).not.toBeInTheDocument()
    })

    it('calls onClose when closing button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()

        render(<GameErrorDialog {...baseProps} onClose={onClose} />)

        await user.click(screen.getByRole('button', { name: /schließen/i }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
