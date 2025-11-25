import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '../index';
import { forwardRef } from 'react';

describe('Breadcrumb Component', () => {
  describe('Snapshot Tests', () => {
    it('matches snapshot for light variant', () => {
      const { container } = render(
        <Breadcrumb variant='light'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/products'>Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light' active>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot for dark variant', () => {
      const { container } = render(
        <Breadcrumb variant='dark'>
          <BreadcrumbList>
            <BreadcrumbItem variant='dark'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='dark' />
            <BreadcrumbItem variant='dark' active>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with ellipsis and custom separator', () => {
      const { container } = render(
        <Breadcrumb variant='light'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light'>
              <span>/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem variant='light'>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light'>
              <span>/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem variant='light' active>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('Interactive Tests', () => {
    it('renders all breadcrumb items and handles click interactions', async () => {
      const handleHomeClick = jest.fn((e: React.MouseEvent) =>
        e.preventDefault()
      );
      const handleProductsClick = jest.fn((e: React.MouseEvent) =>
        e.preventDefault()
      );
      const user = userEvent.setup();

      render(
        <Breadcrumb variant='light'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/' onClick={handleHomeClick}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/products' onClick={handleProductsClick}>
                Products
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light' active>
              <BreadcrumbPage>Laptop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      // Check all items are rendered
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();

      // Test click interactions
      await user.click(screen.getByText('Home'));
      expect(handleHomeClick).toHaveBeenCalledTimes(1);

      await user.click(screen.getByText('Products'));
      expect(handleProductsClick).toHaveBeenCalledTimes(1);

      // Current page should have aria-current="page"
      const currentPage = screen.getByText('Laptop');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
      expect(currentPage).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders custom separator and ellipsis correctly', () => {
      render(
        <Breadcrumb variant='light'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light'>
              <span data-testid='custom-separator'>/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem variant='light'>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator variant='light' />
            <BreadcrumbItem variant='light' active>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      // Custom separator should be rendered
      expect(screen.getByTestId('custom-separator')).toBeInTheDocument();

      // Ellipsis should be present with sr-only text
      expect(screen.getByText('More')).toBeInTheDocument();
      expect(screen.getByText('More')).toHaveClass('sr-only');
    });

    it('applies correct variant classes', () => {
      const { rerender } = render(
        <Breadcrumb variant='light' data-testid='breadcrumb'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toHaveClass('text-slate-600');

      // Rerender with dark variant
      rerender(
        <Breadcrumb variant='dark' data-testid='breadcrumb'>
          <BreadcrumbList>
            <BreadcrumbItem variant='dark'>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(breadcrumb).toHaveClass('text-slate-300');
    });

    it('supports asChild prop with Slot component', () => {
      const CustomLink = forwardRef<
        HTMLAnchorElement,
        React.AnchorHTMLAttributes<HTMLAnchorElement>
      >((props, ref) => <a ref={ref} data-custom='true' {...props} />);
      CustomLink.displayName = 'CustomLink';

      render(
        <Breadcrumb variant='light'>
          <BreadcrumbList>
            <BreadcrumbItem variant='light'>
              <BreadcrumbLink asChild>
                <CustomLink href='/'>Home</CustomLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      const link = screen.getByText('Home');
      expect(link).toHaveAttribute('data-custom', 'true');
    });
  });
});
