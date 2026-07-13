package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import com.stanford.schoolbackend.core.enums.UserRole;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.security.SecurityUtils;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.library.dto.BookLoanResponse;
import com.stanford.schoolbackend.sms.library.dto.IssueLoanRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookLoanService {

    private final BookLoanRepository bookLoanRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;

    @Value("${library.default-loan-days:14}")
    private int defaultLoanDays;

    public BookLoanResponse issueLoan(IssueLoanRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        User borrower = userRepository.findById(request.getBorrowerId())
                .orElseThrow(() -> new ResourceNotFoundException("Borrower not found"));

        if (borrower.getRole() != UserRole.STUDENT && borrower.getRole() != UserRole.TEACHER) {
            throw new IllegalArgumentException("Only students and teachers can borrow books");
        }

        BookCopy copy = bookCopyRepository.findFirstByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE)
                .orElseThrow(() -> new IllegalArgumentException("No available copies for this book"));

        LocalDate borrowedDate = LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : borrowedDate.plusDays(defaultLoanDays);

        copy.setStatus(CopyStatus.BORROWED);
        bookCopyRepository.save(copy);

        BookLoan loan = BookLoan.builder()
                .bookCopy(copy)
                .borrower(borrower)
                .borrowedDate(borrowedDate)
                .dueDate(dueDate)
                .build();

        return toResponse(bookLoanRepository.save(loan));
    }

    public BookLoanResponse returnLoan(Long loanId) {
        BookLoan loan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (loan.getReturnedDate() != null) {
            throw new IllegalArgumentException("This loan has already been returned");
        }

        loan.setReturnedDate(LocalDate.now());
        bookLoanRepository.save(loan);

        BookCopy copy = loan.getBookCopy();
        copy.setStatus(CopyStatus.AVAILABLE);
        bookCopyRepository.save(copy);

        return toResponse(loan);
    }

    public List<BookLoanResponse> listAll() {
        return bookLoanRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<BookLoanResponse> listActive() {
        return bookLoanRepository.findByReturnedDateIsNull().stream().map(this::toResponse).toList();
    }

    public List<BookLoanResponse> listByBorrower(Long borrowerId) {
        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrower not found"));

        boolean isPrivileged = SecurityUtils.currentUserHasRole("ADMIN");
        if (!isPrivileged && !borrower.getEmail().equals(SecurityUtils.currentUserEmail())) {
            throw new AccessDeniedException("You can only view your own loan history");
        }

        return bookLoanRepository.findByBorrowerId(borrowerId).stream().map(this::toResponse).toList();
    }

    private BookLoanResponse toResponse(BookLoan loan) {
        LocalDate today = LocalDate.now();
        String status;
        long daysOverdue = 0;

        if (loan.getReturnedDate() != null) {
            status = "RETURNED";
        } else if (loan.getDueDate().isBefore(today)) {
            status = "OVERDUE";
            daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), today);
        } else {
            status = "BORROWED";
        }

        return BookLoanResponse.builder()
                .id(loan.getId())
                .bookId(loan.getBookCopy().getBook().getId())
                .bookTitle(loan.getBookCopy().getBook().getTitle())
                .copyCode(loan.getBookCopy().getCopyCode())
                .borrowerId(loan.getBorrower().getId())
                .borrowerName(loan.getBorrower().getFirstName() + " " + loan.getBorrower().getLastName())
                .borrowerRole(loan.getBorrower().getRole().name())
                .borrowedDate(loan.getBorrowedDate())
                .dueDate(loan.getDueDate())
                .returnedDate(loan.getReturnedDate())
                .status(status)
                .daysOverdue(daysOverdue)
                .build();
    }
}