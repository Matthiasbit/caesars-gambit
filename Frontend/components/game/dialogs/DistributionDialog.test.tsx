import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DistributionDialog } from './DistributionDialog'

describe('DistributionDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    isOpen: true,
    territoryName: 'Palatin',
    availableTroops: 10,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    moveDialog: false,
    attackDialog: false,
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
    it('should have number input with min=1 and max=availableTroops', () => {
      render(<DistributionDialog {...defaultProps} availableTroops={20} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      expect(input.type).toBe('number')
      expect(input.min).toBe('1')
      expect(input.max).toBe('20')
      expect(input.value).toBe('1')
    })
  })

  describe('Button Operations', () => {
    it('should increment count on plus button click', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      const plusBtn = screen.getByRole('button', { name: /\+/ })
      
      await user.click(plusBtn)
      expect(input.value).toBe('2')
    })

    it('should decrement count on minus button click', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      const plusBtn = screen.getByRole('button', { name: /\+/ })
      const minusBtn = screen.getByRole('button', { name: /−|-/ })
      
      await user.click(plusBtn)
      await user.click(minusBtn)
      expect(input.value).toBe('1')
    })

    it('should not go below minimum (count=1) when minus button is clicked', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      const minusBtn = screen.getByRole('button', { name: /−|-/ })
      
      await user.click(minusBtn)
      expect(input.value).toBe('1')
    })

    it('should not go above maximum when plus button is clicked', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} availableTroops={1} />)
      
      const input = screen.getByRole('spinbutton') as HTMLInputElement
      const plusBtn = screen.getByRole('button', { name: /\+/ })
      
      await user.click(plusBtn)
      expect(input.value).toBe('1')
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

    it('should call onConfirm with updated count after increment', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const plusBtn = screen.getByRole('button', { name: /\+/ })
      const confirmBtn = screen.getByRole('button', { name: /bestätigen|confirm/i })
      
      await user.click(plusBtn)
      await user.click(plusBtn)
      await user.click(confirmBtn)
      
      expect(mockOnConfirm).toHaveBeenCalledWith(3)
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

  describe('Keyboard Support', () => {
    it('should confirm on Enter key', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const input = screen.getByRole('spinbutton')
      await user.click(input)
      await user.keyboard('{Enter}')
      
      expect(mockOnConfirm).toHaveBeenCalledWith(1)
    })

    it('should cancel on Escape key', async () => {
      const user = userEvent.setup()
      render(<DistributionDialog {...defaultProps} />)
      
      const input = screen.getByRole('spinbutton')
      await user.click(input)
      await user.keyboard('{Escape}')
      
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})
