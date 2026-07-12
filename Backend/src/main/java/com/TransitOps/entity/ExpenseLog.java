package com.TransitOps.entity;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.TransitOps.util.ExpenseCategory;

@Entity
@Table(name = "EXPENSE_LOGS")
@Getter
@Setter
@NoArgsConstructor
public class ExpenseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ExpenseLogID")
    private Long expenseLogID;

    @ManyToOne
    @JoinColumn(name = "VehicleID")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "TripID", nullable = true)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(name = "Category")
    private ExpenseCategory category;

    @Column(name = "Amount")
    private Double amount;

    @Column(name = "Description")
    private String description;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "Active")
    private Boolean active;

    @Column(name = "CreatedAt")
    private Date createdAt;
}
