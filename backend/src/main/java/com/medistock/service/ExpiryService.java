package com.medistock.service;

import com.medistock.dto.medicine.MedicineResponse;
import com.medistock.entity.Batch;
import com.medistock.entity.Medicine;
import com.medistock.enums.ExpiryStatus;
import com.medistock.repository.BatchRepository;
import com.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpiryService {

    // Medicines expiring within this many days are flagged as EXPIRING_SOON
    private static final int EXPIRING_SOON_THRESHOLD_DAYS = 90;

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;

    public ExpiryService(MedicineRepository medicineRepository,
                         BatchRepository batchRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    // ── GET EXPIRING-SOON MEDICINES ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiringMedicines() {
        return medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRING_SOON)
                .stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── GET EXPIRED MEDICINES ─────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MedicineResponse> getExpiredMedicines() {
        return medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRED)
                .stream()
                .map(MedicineResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ── EXPIRY REPORT (summary map) ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public Map<String, Object> getExpiryReport() {
        LocalDate today = LocalDate.now();
        LocalDate soonThreshold = today.plusDays(EXPIRING_SOON_THRESHOLD_DAYS);

        List<Medicine> expiredMedicines = medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRED);
        List<Medicine> expiringSoonMedicines = medicineRepository.findByExpiryStatus(ExpiryStatus.EXPIRING_SOON);
        List<Medicine> validMedicines = medicineRepository.findByExpiryStatus(ExpiryStatus.VALID);

        // Near-expiry batches (within threshold)
        List<Batch> nearExpiryBatches = batchRepository.findByExpiryDateBefore(soonThreshold)
                .stream()
                .filter(b -> b.getExpiryDate().isAfter(today))
                .collect(Collectors.toList());

        Map<String, Object> report = new HashMap<>();
        report.put("reportDate", today.toString());
        report.put("expiryThresholdDays", EXPIRING_SOON_THRESHOLD_DAYS);
        report.put("totalExpired", expiredMedicines.size());
        report.put("totalExpiringSoon", expiringSoonMedicines.size());
        report.put("totalValid", validMedicines.size());
        report.put("totalMedicines", expiredMedicines.size() + expiringSoonMedicines.size() + validMedicines.size());
        report.put("nearExpiryBatchCount", nearExpiryBatches.size());
        report.put("expiredMedicines", expiredMedicines.stream()
                .map(MedicineResponse::fromEntity).collect(Collectors.toList()));
        report.put("expiringSoonMedicines", expiringSoonMedicines.stream()
                .map(MedicineResponse::fromEntity).collect(Collectors.toList()));
        return report;
    }

    // ── REFRESH EXPIRY STATUS (called by scheduler or manually) ──────────────
    @Transactional
    public int refreshExpiryStatuses() {
        LocalDate today = LocalDate.now();
        LocalDate soonThreshold = today.plusDays(EXPIRING_SOON_THRESHOLD_DAYS);
        int updated = 0;

        List<Medicine> allMedicines = medicineRepository.findAll();
        for (Medicine medicine : allMedicines) {
            if (medicine.getNearestExpiryDate() == null) continue;

            ExpiryStatus newStatus;
            if (!medicine.getNearestExpiryDate().isAfter(today)) {
                newStatus = ExpiryStatus.EXPIRED;
            } else if (!medicine.getNearestExpiryDate().isAfter(soonThreshold)) {
                newStatus = ExpiryStatus.EXPIRING_SOON;
            } else {
                newStatus = ExpiryStatus.VALID;
            }

            if (medicine.getExpiryStatus() != newStatus) {
                medicine.setExpiryStatus(newStatus);
                medicineRepository.save(medicine);
                updated++;
            }
        }

        // Also refresh batch-level expiry statuses
        for (Batch batch : batchRepository.findAll()) {
            ExpiryStatus batchStatus;
            if (!batch.getExpiryDate().isAfter(today)) {
                batchStatus = ExpiryStatus.EXPIRED;
            } else if (!batch.getExpiryDate().isAfter(soonThreshold)) {
                batchStatus = ExpiryStatus.EXPIRING_SOON;
            } else {
                batchStatus = ExpiryStatus.VALID;
            }
            if (batch.getExpiryStatus() != batchStatus) {
                batch.setExpiryStatus(batchStatus);
                batchRepository.save(batch);
            }
        }

        return updated;
    }
}
