import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DistributionDialog } from './DistributionDialog'

describe('DistributionDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    isOpen: true,
    availableTroops: 10,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    moveDialog: false,
    attackDialog: false,
    ownerColorMap: {},
    territories: [
        { territory: 'Palatin', owner: 'Player1', troops: 5 },
        { territory: 'Forum', owner: 'Player2', troops: 3 }
    ],
    distTo: 'Palatin',
    moveExecuted: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<DistributionDialog {...defaultProps} />)
      expect(screen.getByText(/Truppen verteilen/i)).toBeInTheDocument()
      expect(screen.getByText(/Palatin/i)).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<DistributionDialog {...defaultProps} isOpen={false} />)
      expect(screen.queryByText(/Truppen verteilen/i)).not.toBeInTheDocument()
    })
  })

  describe('Input Constraints', () => {
    it('should have a slider with min=1 and max=availableTroops', () => {
      render(<DistributionDialog {...defaultProps} availableTroops={20} />)
      
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '20')
      expect(slider).toHaveAttribute('aria-valuenow', '1')
    })
  })

  describe('Callbacks', () => {
    it('should call onConfirm with count on confirm button click', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const confirmBtn = screen.getByRole('button', { name: /bestätigen|confirm/i })
      await user.click(confirmBtn)
      
      expect(mockOnConfirm).toHaveBeenCalledWith(1)
    })

    it('should call onCancel on cancel button click', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const cancelBtn = screen.getByRole('button', { name: /abbrechen|cancel/i })
      await user.click(cancelBtn)
      
      expect(mockOnCancel).toHaveBeenCalled()
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })
  })
})
